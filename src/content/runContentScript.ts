import "./style.css";
import log from "@/lib/log";
import { getRandomTimeoutMs, scheduleTimeout } from "../lib/utils";
import getSiteAdapter from "../lib/site/getSiteAdapter";
import { onExtensionMessage } from "@/messages/onExtensionMessage";
import { sendExtensionMessage } from "@/messages/sendExtensionMessage";
import deepMerge from "@/lib/deepMerge";
import { loadExtensionSettings } from "../lib/loadExtensionSettings";
import { getRuntimeSyncChannels } from "@/background/runtime/runtimeHelpers";
import { EnhancementHandler } from "./handlers/EnhancementHandler";
import {
    createEnhancementScheduler,
    type EnhancementRunReason,
} from "./enhancementScheduler";

import type { ContentScriptContext } from "#imports";
import type { GlobalSettings, SiteSettings } from "@/store/types";
import type { RuntimeChannel, StoreChangedMessage } from "@/messages/types";

async function runContentScript(ctx: ContentScriptContext) {
    log("Loaded.");

    let observer: MutationObserver;
    const observerConfig = { childList: true, subtree: true };

    const adapter = getSiteAdapter();

    let { globals, site } = await loadExtensionSettings(adapter.config.name);
    const enhancementHandler = new EnhancementHandler(adapter, {
        ...globals,
        ...site,
    });

    async function syncRuntime(channels?: RuntimeChannel[]) {
        for (const channel of getRuntimeSyncChannels(channels)) {
            switch (channel) {
                case "opportunities":
                    if (!adapter.isListingsPage()) continue;

                    await sendExtensionMessage({
                        type: "runtime-sync",
                        data: {
                            channel,
                            siteName: adapter.config.name,
                            data: adapter.extractOpportunities(),
                        },
                    });
                    break;
            }
        }
    }

    async function runEnhancements(reason: EnhancementRunReason) {
        log("Enhancement run started.", { reason });
        observer.disconnect();
        try {
            await enhancementHandler.update({ ...globals, ...site });
            await enhancementHandler.run();
            await syncRuntime();
        } finally {
            observer.observe(document.body, observerConfig);
            log("Enhancement run finished.", { reason });
        }
    }

    const enhancementScheduler = createEnhancementScheduler({
        run: runEnhancements,
    });

    observer = new MutationObserver((mutations) => {
        const hasRelevantChanges = mutations.some(
            (m) => m.addedNodes.length > 0 || m.removedNodes.length > 0,
        );
        if (!hasRelevantChanges) return;

        enhancementScheduler.schedule("dom", { followUp: true });
    });

    const pageReloadTimeout = scheduleTimeout(() => {
        if (!document.hidden) {
            pageReloadTimeout.reset();
            return;
        }

        log("Refreshing page...");
        location.reload();
    });

    // Apply the enhancements initially
    enhancementScheduler.schedule("initial", { delay: 0, followUp: true });

    const supportsAutoReload = adapter.hasFeature("autoReload");

    function initializeAutoReload(autoReload: SiteSettings["autoReload"]) {
        if (!supportsAutoReload || !autoReload.enabled) return;

        const delay = getRandomTimeoutMs(
            autoReload.minInterval,
            autoReload.maxInterval,
        );

        log("Page refresh scheduled.");
        pageReloadTimeout.setDelay(delay);
        pageReloadTimeout.start();

        return pageReloadTimeout;
    }

    function updateAutoReload(
        previous: SiteSettings["autoReload"],
        next: SiteSettings["autoReload"],
    ) {
        const intervalsChanged =
            next.minInterval !== previous.minInterval ||
            next.maxInterval !== previous.maxInterval;

        if (!next.enabled) {
            if (previous.enabled) {
                log("Page refresh canceled.");
            }
            pageReloadTimeout.clear();
            return;
        }

        const delay = getRandomTimeoutMs(next.minInterval, next.maxInterval);

        if (!previous.enabled) {
            log("Page refresh scheduled.");
            pageReloadTimeout.setDelay(delay);
            pageReloadTimeout.start();
            return;
        }

        if (intervalsChanged) {
            log(
                "Page refresh interval updated. New interval (min):",
                delay / 60000,
            );
            pageReloadTimeout.setDelay(delay);
        }
    }

    initializeAutoReload(site.autoReload);

    const irrelevantKeys: Record<string, Set<string>> = {
        globals: new Set<keyof GlobalSettings>(["lastPopupOpenedAt"]),
        sites: new Set<keyof SiteSettings>(["opportunityAlerts"]),
    };

    const unsubStoreChanged = onExtensionMessage("store-changed", (payload) => {
        if (payload.namespace === "globals") {
            globals = deepMerge(globals, payload.data);
        } else {
            if (payload.entry !== adapter.config.name) return;

            const previousAutoReload = site.autoReload;
            site = deepMerge(site, payload.data);

            if (supportsAutoReload && payload.data.autoReload) {
                updateAutoReload(previousAutoReload, site.autoReload);
            }
        }

        const keys = Object.keys(payload.data);
        const ignored = irrelevantKeys[payload.namespace];
        if (ignored && keys.every((key) => ignored.has(key))) return;

        enhancementScheduler.schedule("settings");
    });

    const unsubRuntimeSync = onExtensionMessage(
        "runtime-sync-request",
        async (payload) => {
            await syncRuntime(payload?.channels);
        },
    );

    const unsubNetwork = adapter.observeNetwork();

    adapter.on("studyCompletion", (data) => {
        sendExtensionMessage({
            type: "study-completion",
            data: {
                siteName: adapter.config.name,
                url: data.url,
            },
        });
    });

    ctx.onInvalidated(() => {
        enhancementScheduler.cancel();
        observer.disconnect();
        pageReloadTimeout.clear();
        unsubStoreChanged();
        unsubRuntimeSync();
        unsubNetwork();
        log("Content script invalidated.");
    });
}

export { runContentScript };
