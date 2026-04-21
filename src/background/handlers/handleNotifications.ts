import { SettingsStore } from "@/store/SettingsStore";
import {
    getProvider,
    ProviderConfigMap,
    type ProviderName,
} from "@/providers/providers";
import { NOTIFY_TTL_MS, NAME_CACHE_TTL_MS } from "@/constants";
import { capitalize } from "@/lib/utils";
import { sendExtensionMessage } from "@/messages/sendExtensionMessage";
import { sites, type SupportedHosts } from "@/adapters/siteConfigs";
import { playSound } from "@/lib/playSound";
import {
    matchesAlertRules,
    type AlertRules,
} from "@/lib/notifications/alertRules";

import type { StudyInfo } from "@/adapters/BaseAdapter";
import type { MessageMap } from "@/messages/types";
import type {
    GlobalSettings,
    NotificationSound,
    SiteSettings,
} from "@/store/types";

export interface NotificationData {
    title: string;
    message: string;
    iconUrl?: string;
    link?: string;
}

const notificationActions = new Map<string, () => void | Promise<void>>();

const defaultNotificationIconUrl = browser.runtime.getURL("/icon-48.png");

async function ensureOffscreenDocument() {
    const url = "/offscreen.html";
    const offscreenUrl = browser.runtime.getURL(url);

    const contexts = await browser.runtime.getContexts({
        contextTypes: ["OFFSCREEN_DOCUMENT"],
        documentUrls: [offscreenUrl],
    });

    if (contexts.length > 0) return;

    await browser.offscreen.createDocument({
        url,
        reasons: ["AUDIO_PLAYBACK"],
        justification: "Play alert sounds for new study notifications.",
    });
}

async function playNotificationSound(sound: NotificationSound, volume: number) {
    if (import.meta.env.BROWSER === "firefox") {
        await playSound({ type: sound, volume });
    } else {
        await ensureOffscreenDocument();
        await sendExtensionMessage({
            type: "play-sound",
            data: { sound, volume },
        });
    }
}

type ProviderSendResult = {
    sent: boolean;
    updatedProviders: Partial<ProviderConfigMap>;
};

type ProviderEntries = Array<[ProviderName, ProviderConfigMap[ProviderName]]>;

function getEnabledProviders(
    providers: GlobalSettings["providers"],
): ProviderEntries {
    return Object.entries(providers).filter(
        (entry): entry is ProviderEntries[number] => entry[1].enabled,
    );
}

function entriesToProviders(
    entries: ProviderEntries,
): GlobalSettings["providers"] {
    return Object.fromEntries(entries) as GlobalSettings["providers"];
}

async function isIdleOrLocked(idleThreshold: number): Promise<boolean> {
    const state = await browser.idle.queryState(idleThreshold);
    return state === "idle" || state === "locked";
}

async function sendProviderNotifications(
    siteName: string,
    notifications: NotificationData[],
    providers: GlobalSettings["providers"],
): Promise<ProviderSendResult> {
    const enabledProviders = getEnabledProviders(providers);

    let providerSendResult: ProviderSendResult = {
        sent: false,
        updatedProviders: {},
    };

    if (enabledProviders.length === 0)
        return { sent: false, updatedProviders: {} };

    for (const [name, config] of enabledProviders) {
        try {
            const provider = getProvider(name as ProviderName, config);
            const combined = notifications
                .map((notification) => {
                    const { title, message, link } = notification;
                    return `${title}\n${message}\n${link}`;
                })
                .join("\n\n");

            const studyLabel = notifications.length === 1 ? "Study" : "Studies";

            const ok = await provider.sendMessage({
                title: `${capitalize(siteName)} - ${notifications.length} New ${studyLabel}`,
                body: combined,
            });

            if (ok) {
                providerSendResult.sent = true;
                providerSendResult.updatedProviders[name as ProviderName] =
                    provider.configData;
            } else {
                console.error(`Provider "${name}" failed to send.`);
            }
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    }

    return providerSendResult;
}

async function sendBrowserNotifications(
    notifications: NotificationData[],
): Promise<boolean> {
    let sent = false;

    for (const notification of notifications) {
        try {
            const { title, message, link, iconUrl } = notification;
            const resolvedIconUrl =
                iconUrl && iconUrl.length > 0
                    ? iconUrl
                    : defaultNotificationIconUrl;
            const notificationId = await browser.notifications.create({
                type: "basic",
                iconUrl: resolvedIconUrl,
                title,
                message,
            });

            sent = true;
            notificationActions.set(notificationId, async () => {
                await browser.tabs.create({
                    active: true,
                    url: link,
                });
            });
        } catch (error) {
            console.error("Error creating browser notification:", error);
        }
    }

    return sent;
}

const siteHostByName = Object.fromEntries(
    Object.entries(sites).map(([host, config]) => [config.name, host]),
) as Record<string, SupportedHosts>;

function getSiteIconUrl(siteName: string): string | undefined {
    const host = siteHostByName[siteName];
    if (!host) return undefined;
    const config = sites[host];
    return `https://${host}${config.iconPath}`;
}

function buildNotification(
    study: StudyInfo,
    siteName: string,
): NotificationData {
    const { title, reward, rate, symbol, link } = study;

    const rewardText =
        reward !== null
            ? `${symbol ?? ""}${reward.toFixed(2)}`
            : "Unknown reward";
    const rateText =
        rate !== null ? `${symbol ?? ""}${rate.toFixed(2)}/hr` : "Unknown rate";

    const siteLabel = capitalize(siteName);

    return {
        title: title ?? siteLabel,
        message: `${siteLabel} • ${rewardText} • ${rateText}`,
        iconUrl: getSiteIconUrl(siteName),
        link: link ?? undefined,
    };
}

function pruneStudyCache(cache: SiteSettings["studyAlerts"]["cache"]) {
    const now = Date.now();

    const studies = { ...cache.studies };
    for (const [key, timestamp] of Object.entries(studies)) {
        if (now - timestamp >= NOTIFY_TTL_MS) delete studies[key];
    }

    const researchers = { ...cache.researchers };
    for (const [name, timestamp] of Object.entries(researchers)) {
        if (now - timestamp >= NAME_CACHE_TTL_MS) delete researchers[name];
    }

    const titles = { ...cache.titles };
    for (const [title, timestamp] of Object.entries(titles)) {
        if (now - timestamp >= NAME_CACHE_TTL_MS) delete titles[title];
    }

    return { studies, researchers, titles };
}

export async function handleStudiesDetected(
    store: SettingsStore,
    payload: MessageMap["studies-detected"],
): Promise<void> {
    const { siteName, studies, hidden } = payload;
    if (studies.length === 0) return;

    const siteStore = store.sites.entry(siteName);
    const now = Date.now();

    let newStudies: StudyInfo[] = [];
    let rules!: AlertRules;

    await siteStore.update((current) => {
        rules = current.studyAlerts.rules;
        const nextStudyCache = pruneStudyCache(current.studyAlerts.cache);

        newStudies = studies.filter((s) => !(s.id in nextStudyCache.studies));
        if (newStudies.length === 0) return {};

        for (const study of newStudies) {
            nextStudyCache.studies[study.id] = now;
        }

        for (const study of newStudies) {
            if (!study.researcher) continue;
            const name = study.researcher.trim();
            if (!(name in nextStudyCache.researchers))
                nextStudyCache.researchers[name] = now;
        }

        for (const study of newStudies) {
            if (!study.title) continue;
            const title = study.title.trim();
            if (title && !(title in nextStudyCache.titles))
                nextStudyCache.titles[title] = now;
        }

        return {
            studyAlerts: {
                cache: nextStudyCache,
            },
        };
    });

    if (newStudies.length === 0) return;

    if (!hidden) return;

    const notifications: NotificationData[] = [];
    for (const study of newStudies) {
        if (!matchesAlertRules(study, rules)) continue;

        notifications.push(buildNotification(study, siteName));
    }

    if (notifications.length === 0) return;

    await deliverNotifications(store, {
        siteName,
        notifications,
    });
}

async function sendProviderNotificationsAndPersist(
    store: SettingsStore,
    siteName: string,
    notifications: NotificationData[],
    providers: GlobalSettings["providers"],
): Promise<boolean> {
    const { sent, updatedProviders } = await sendProviderNotifications(
        siteName,
        notifications,
        providers,
    );

    if (Object.keys(updatedProviders).length > 0) {
        await store.globals.set({ providers: updatedProviders });
    }

    return sent;
}

async function sendProviderEntriesAndPersist(
    store: SettingsStore,
    siteName: string,
    notifications: NotificationData[],
    providers: ProviderEntries,
): Promise<boolean> {
    if (providers.length === 0) return false;

    return await sendProviderNotificationsAndPersist(
        store,
        siteName,
        notifications,
        entriesToProviders(providers),
    );
}

async function deliverAutoNotifications(
    store: SettingsStore,
    siteName: string,
    notifications: NotificationData[],
    browserEnabled: boolean,
    providers: GlobalSettings["providers"],
    idleThreshold: number,
): Promise<boolean> {
    const enabledProviders = getEnabledProviders(providers);

    const immediate: ProviderEntries = [];
    const idleOnly: ProviderEntries = [];

    for (const entry of enabledProviders) {
        const [, config] = entry;
        if (config.onlyWhenIdle) {
            idleOnly.push(entry);
        } else {
            immediate.push(entry);
        }
    }

    const deliveryResults: boolean[] = [];

    deliveryResults.push(
        await sendProviderEntriesAndPersist(
            store,
            siteName,
            notifications,
            immediate,
        ),
    );

    if (idleOnly.length > 0 && (await isIdleOrLocked(idleThreshold))) {
        deliveryResults.push(
            await sendProviderEntriesAndPersist(
                store,
                siteName,
                notifications,
                idleOnly,
            ),
        );
    }

    if (browserEnabled) {
        deliveryResults.push(await sendBrowserNotifications(notifications));
    }

    return deliveryResults.some(Boolean);
}

export async function deliverNotifications(
    store: SettingsStore,
    payload: MessageMap["study-alert"],
): Promise<boolean> {
    const { siteName, notifications, delivery } = payload;
    const mode = delivery ?? "auto";

    const {
        notifications: {
            delivery: { browser: browserEnabled, sound },
        },
    } = await store.namespace("globals").get(["notifications"]);

    if (sound.enabled) {
        try {
            await playNotificationSound(sound.type, sound.volume);
        } catch (error) {
            console.error("Error playing sound:", error);
        }
    }

    if (mode === "browser") {
        if (!browserEnabled) return false;
        return await sendBrowserNotifications(notifications);
    }

    const { providers, idleThreshold } = await store.globals.get([
        "providers",
        "idleThreshold",
    ]);

    if (mode === "provider") {
        return await sendProviderNotificationsAndPersist(
            store,
            siteName,
            notifications,
            providers,
        );
    }

    return await deliverAutoNotifications(
        store,
        siteName,
        notifications,
        browserEnabled,
        providers,
        idleThreshold,
    );
}

export async function handleNotificationClicked(id: string): Promise<void> {
    const action = notificationActions.get(id);
    if (!action) return;
    await action();

    notificationActions.delete(id);
    await browser.notifications.clear(id);
}

export async function handleNotificationClosed(id: string): Promise<void> {
    notificationActions.delete(id);
}
