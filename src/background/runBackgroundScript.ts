import { browser } from "#imports";
import { onExtensionMessage } from "@/messages/onExtensionMessage";
import { SettingsStore } from "@/store/SettingsStore";
import {
    supportedSites,
    supportedHosts,
    sites,
    type SiteName,
} from "@/adapters/siteConfigs";
import { handleStoreFetch } from "./handlers/handleStoreFetch";
import { handleStoreMutate } from "./handlers/handleStoreMutate";
import {
    handleNotificationClicked,
    handleNotificationClosed,
    handleStudyAlert,
} from "./handlers/handleNotifications";
import { safeSendPageMessage } from "./utils/safeSendPageMessage";
import { safeSendTabMessage } from "./utils/safeSendTabMessage";

import type { Message, RuntimeChannel, RuntimeDataMap } from "@/messages/types";

function runBackgroundScript() {
    const store = new SettingsStore();
    const runtimeCache: {
        [K in RuntimeChannel]: Partial<Record<SiteName, RuntimeDataMap[K]>>;
    } = {
        studies: {},
    };

    const filteredUrls = supportedHosts.flatMap((host) =>
        sites[host].watchedRequestTargets.map(
            (target) => `https://${target}*` as const,
        ),
    );

    browser.webRequest.onCompleted.addListener(
        (details) => {
            if (details.tabId < 0) return;

            safeSendTabMessage(details.tabId, {
                type: "network",
                data: {
                    url: details.url,
                    method: details.method,
                    statusCode: details.statusCode,
                },
            });
        },
        { urls: filteredUrls },
    );

    async function broadcastStoreChanged(
        message: Message<"store-changed">,
        shouldSendToTab: (tab: Browser.tabs.Tab) => boolean,
    ): Promise<void> {
        await safeSendPageMessage(message);

        const tabs = await browser.tabs.query({});

        for (const tab of tabs) {
            if (!tab.id || !tab.url) continue;
            if (!shouldSendToTab(tab)) continue;

            await safeSendTabMessage(tab.id, message);
        }
    }

    browser.notifications.onClicked.addListener(async (id) =>
        handleNotificationClicked(id),
    );

    browser.notifications.onClosed.addListener(async (id) =>
        handleNotificationClosed(id),
    );

    onExtensionMessage("study-alert", (payload) =>
        handleStudyAlert(store, payload),
    );

    store.globals.subscribe(async (changed) => {
        await broadcastStoreChanged(
            {
                type: "store-changed",
                data: { namespace: "globals", data: changed },
            },
            (tab) => supportedSites.some((site) => tab.url!.includes(site)),
        );
    });

    for (const siteName of supportedSites) {
        store.sites.entry(siteName).subscribe(async (changed) => {
            await broadcastStoreChanged(
                {
                    type: "store-changed",
                    data: {
                        namespace: "sites",
                        entry: siteName,
                        data: changed,
                    },
                },
                (tab) => tab.url!.includes(siteName),
            );
        });
    }

    onExtensionMessage("fetch", async (payload) => {
        try {
            const response = await fetch(payload.url);
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    });

    onExtensionMessage("store-fetch", (payload) =>
        handleStoreFetch(store, payload),
    );

    onExtensionMessage("store-patch", (payload) =>
        handleStoreMutate(store, "store-patch", payload),
    );
    onExtensionMessage("store-set", (payload) =>
        handleStoreMutate(store, "store-set", payload),
    );

    function runtimeEquals<K extends RuntimeChannel>(
        current: RuntimeDataMap[K] | undefined,
        next: RuntimeDataMap[K],
    ): boolean {
        return JSON.stringify(current ?? null) === JSON.stringify(next);
    }

    onExtensionMessage("runtime-sync", async (payload) => {
        const current = runtimeCache[payload.channel][payload.siteName];

        const unchanged = runtimeEquals(current, payload.data);
        if (unchanged) return;

        runtimeCache[payload.channel][payload.siteName] = structuredClone(
            payload.data,
        );

        await safeSendPageMessage({
            type: "runtime-changed",
            data: {
                channel: payload.channel,
                siteName: payload.siteName,
                data: structuredClone(payload.data),
            },
        });
    });

    onExtensionMessage("runtime-fetch", (payload) => {
        const data = runtimeCache[payload.channel][payload.siteName];
        if (data === undefined) return null;

        return {
            channel: payload.channel,
            siteName: payload.siteName,
            data: structuredClone(data),
        };
    });

    onExtensionMessage("study-completion", async (payload) => {
        const { siteName } = payload;

        await store.sites.entry(siteName).update((current) => {
            const nextDailyCount =
                current.analytics.dailyStudyCompletions.count + 1;
            const nextTimestamp =
                current.analytics.dailyStudyCompletions.count === 0
                    ? Date.now()
                    : current.analytics.dailyStudyCompletions.timestamp;

            return {
                analytics: {
                    totalStudyCompletions:
                        current.analytics.totalStudyCompletions + 1,
                    bestDailyStudyCompletions: Math.max(
                        current.analytics.bestDailyStudyCompletions,
                        nextDailyCount,
                    ),
                    dailyStudyCompletions: {
                        count: nextDailyCount,
                        timestamp: nextTimestamp,
                    },
                },
            };
        });
    });
}

export { runBackgroundScript };
