import { SettingsStore } from "@/store/SettingsStore";
import {
    getProvider,
    ProviderConfigMap,
    type ProviderName,
} from "@/providers/providers";
import { NotificationData } from "@/enhancements/NotificationsEnhancement";
import { capitalize } from "@/lib/utils";
import { sendExtensionMessage } from "@/messages/sendExtensionMessage";

import type { MessageMap } from "@/messages/types";
import type { GlobalSettings } from "@/store/types";

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

type ProviderSendResult = {
    sent: boolean;
    updatedProviders: Partial<ProviderConfigMap>;
};

async function sendProviderNotifications(
    siteName: string,
    notifications: NotificationData[],
    providers: GlobalSettings["providers"],
): Promise<ProviderSendResult> {
    const enabledProviders = Object.entries(providers).filter(
        ([, config]) => config.enabled,
    );

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

            const ok = await provider.sendMessage({
                title: `${capitalize(siteName)} - ${notifications.length} New Study${notifications.length > 1 ? "s" : ""}`,
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

export async function handleStudyAlert(
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
            await ensureOffscreenDocument();
            await sendExtensionMessage({
                type: "play-sound",
                data: {
                    sound: sound.type,
                    volume: sound.volume,
                },
            });
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
        const { sent, updatedProviders } = await sendProviderNotifications(
            siteName,
            notifications,
            providers,
        );

        if (Object.keys(updatedProviders).length > 0) {
            await store.globals.set({
                providers: updatedProviders,
            });
        }

        return sent;
    }

    const enabledProviders = Object.entries(providers).filter(
        ([, config]) => config.enabled,
    );
    if (browserEnabled && enabledProviders.length === 0) {
        return await sendBrowserNotifications(notifications);
    }

    const state = await browser.idle.queryState(idleThreshold);

    if (state === "idle" || state === "locked") {
        const { sent, updatedProviders } = await sendProviderNotifications(
            siteName,
            notifications,
            providers,
        );

        if (Object.keys(updatedProviders).length > 0) {
            await store.globals.set({
                providers: updatedProviders,
            });
        }

        return sent;
    }

    if (browserEnabled) return await sendBrowserNotifications(notifications);

    return false;
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
