import { browser } from "#imports";
import { onExtensionMessage } from "@/messages/onExtensionMessage";
import { safeSendPageMessage } from "../utils/safeSendPageMessage";
import {
    clearRuntimeTab,
    createRuntimeCache,
    getListingsSiteName,
    readRuntimeCache,
    updateRuntimeCache,
} from "./runtimeCache";

import type { SiteName } from "@/adapters/siteConfigs";
import type { RuntimeChannel, RuntimeDataMap } from "@/messages/types";

async function broadcastRuntimeChanged<K extends RuntimeChannel>(
    channel: K,
    siteName: SiteName,
    data: RuntimeDataMap[K] | null,
): Promise<void> {
    await safeSendPageMessage({
        type: "runtime-changed",
        data: {
            channel,
            siteName,
            data,
        },
    });
}

export function registerRuntimeSync(): void {
    const runtimeCache = createRuntimeCache();

    async function clearRuntimeForTab(
        tabId: number,
        retainSiteName: SiteName | null = null,
    ): Promise<void> {
        const changes = clearRuntimeTab(runtimeCache, tabId, retainSiteName);

        for (const change of changes) {
            await broadcastRuntimeChanged(
                change.channel,
                change.siteName,
                change.data,
            );
        }
    }

    browser.tabs.onRemoved.addListener((tabId) => {
        void clearRuntimeForTab(tabId);
    });

    browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
        if (changeInfo.url === undefined) return;

        const retainSiteName = getListingsSiteName(changeInfo.url);
        void clearRuntimeForTab(tabId, retainSiteName);
    });

    onExtensionMessage("runtime-sync", async (payload, sender) => {
        const tabId = sender.tab?.id;
        if (tabId === undefined) return;

        const result = updateRuntimeCache(
            runtimeCache,
            payload.channel,
            payload.siteName,
            tabId,
            payload.data,
        );
        if (!result.changed) return;

        await broadcastRuntimeChanged(
            payload.channel,
            payload.siteName,
            structuredClone(result.data),
        );
    });

    onExtensionMessage("runtime-fetch", (payload) => {
        const data = readRuntimeCache(
            runtimeCache,
            payload.channel,
            payload.siteName,
        );
        if (data === null) return null;

        return {
            ...payload,
            data: structuredClone(data),
        };
    });
}
