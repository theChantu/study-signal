<script lang="ts">
    import { onMount } from "svelte";
    import {
        defaultGlobalSettings,
        defaultGlobalSettingsKeys,
    } from "@/store/defaultGlobalSettings";
    import { sites, type SupportedHosts } from "@/adapters/siteConfigs";
    import { sendExtensionMessage } from "@/messages/sendExtensionMessage";
    import ToastHost from "@/components/ToastHost.svelte";
    import { ChevronDown, LoaderCircle } from "@lucide/svelte";
    import { capitalize } from "@/lib/utils";
    import {
        defaultSiteSettings,
        defaultSiteSettingsKeys,
    } from "@/store/defaultSiteSettings";
    import { settingsState, uiState } from "./state.svelte";
    import { handleQueueMutation } from "./handlers/handleQueueMutation";
    import {
        handleAddResearcher,
        handleRemoveResearcher,
    } from "./handlers/handleResearcher";
    import DebugSettings from "./components/settings/debug/DebugSettings.svelte";
    import HighlightSettings from "./components/settings/HighlightSettings.svelte";
    import AutoReloadSettings from "./components/settings/AutoReloadSettings.svelte";
    import ProviderSettings from "./components/settings/ProviderSettings.svelte";
    import CurrencySettings from "./components/settings/CurrencySettings.svelte";
    import NotificationSettings from "./components/settings/NotificationSettings.svelte";

    import type { ActiveSiteState } from "./types";

    const siteUrls = Object.keys(sites) as SupportedHosts[];

    const activeSite: ActiveSiteState = $derived({
        url: uiState.selectedHost,
        name: sites[uiState.selectedHost].name,
        settings: settingsState.sites[uiState.selectedHost],
    });

    let hasLoadedGlobals = false;

    async function loadGlobalsOnce() {
        if (hasLoadedGlobals) return;
        try {
            const response = await sendExtensionMessage({
                type: "store-fetch",
                data: {
                    namespace: "globals",
                    data: { keys: defaultGlobalSettingsKeys },
                },
            });

            settingsState.globals = {
                ...defaultGlobalSettings,
                ...response.data,
            };
            hasLoadedGlobals = true;
        } catch (error) {
            console.error(error);
        }
    }

    async function handleLoadSite(host: SupportedHosts) {
        await loadGlobalsOnce();
        if (host in settingsState.sites) return;
        try {
            const response = await sendExtensionMessage({
                type: "store-fetch",
                data: {
                    namespace: "sites",
                    entry: sites[host].name,
                    data: { keys: defaultSiteSettingsKeys },
                },
            });

            if (response.namespace === "globals") return;

            settingsState.sites[host] = {
                ...defaultSiteSettings,
                ...response.data,
            };
        } catch (error) {
            console.error(error);
        }
    }

    onMount(async () => {
        const [tab] = await browser.tabs.query({
            active: true,
            currentWindow: true,
        });
        if (tab?.url) {
            try {
                const host = new URL(tab.url).hostname as SupportedHosts;
                if (host in sites) uiState.selectedHost = host;
            } catch (error) {
                console.error(error);
            }
        }

        await handleLoadSite(uiState.selectedHost);
    });

    const siteEnhancements = $derived(
        new Set(sites[activeSite.url].enhancements),
    );
</script>

<div class="p-4 flex flex-col gap-4">
    <div>
        <div class="relative text-gray-500">
            <select
                class="w-full py-2 pl-2.5 pr-8 rounded-md border border-white/8 bg-white/4 hover:bg-white/4 text-gray-100 text-[0.9rem] font-semibold font-[inherit] outline-none appearance-none cursor-pointer focus:border-white/20 [&_option]:bg-[#1a1d21] [&_option]:text-gray-300"
                value={uiState.selectedHost}
                onchange={(e) => {
                    uiState.selectedHost = e.currentTarget
                        .value as SupportedHosts;
                    handleLoadSite(uiState.selectedHost);
                }}
            >
                {#each siteUrls as url}
                    <option value={url}>
                        {capitalize(sites[url].name)}
                    </option>
                {/each}
            </select>
            <div
                class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            >
                <ChevronDown size={14} />
            </div>
        </div>
    </div>

    {#if !activeSite.settings}
        <div
            class="border-t border-white/6 pt-3 p-8 flex items-center justify-center gap-2 text-gray-500 text-[0.82rem]"
        >
            <LoaderCircle size={18} class="animate-spin" />
            <span>Loading settings...</span>
        </div>
    {:else}
        {#if siteEnhancements.has("highlightRates")}
            <HighlightSettings
                value={activeSite.settings?.highlightRates.enabled}
                onToggle={() =>
                    handleQueueMutation("store-patch", {
                        namespace: "sites",
                        entry: activeSite.name,
                        data: {
                            highlightRates: {
                                enabled:
                                    !activeSite.settings?.highlightRates
                                        .enabled,
                            },
                        },
                    })}
            />
        {/if}

        {#if siteEnhancements.has("currencyConversion")}
            <CurrencySettings
                value={activeSite.settings?.currencyConversion.enabled}
                selectedCurrency={activeSite.settings?.currencyConversion
                    .selectedCurrency}
                onToggle={() =>
                    handleQueueMutation("store-patch", {
                        namespace: "sites",
                        entry: activeSite.name,
                        data: {
                            currencyConversion: {
                                enabled:
                                    !activeSite.settings?.currencyConversion
                                        .enabled,
                            },
                        },
                    })}
                onCurrencyChange={(currency) =>
                    handleQueueMutation("store-patch", {
                        namespace: "sites",
                        entry: activeSite.name,
                        data: {
                            currencyConversion: {
                                selectedCurrency: currency,
                            },
                        },
                    })}
            />
        {/if}

        {#if siteEnhancements.has("newSurveyNotifications")}
            <NotificationSettings
                value={activeSite.settings?.newSurveyNotifications.enabled}
                onToggle={() =>
                    handleQueueMutation("store-patch", {
                        namespace: "sites",
                        entry: activeSite.name,
                        data: {
                            newSurveyNotifications: {
                                enabled:
                                    !activeSite.settings?.newSurveyNotifications
                                        .enabled,
                            },
                        },
                    })}
                newNotifications={activeSite.settings?.newSurveyNotifications}
                onAddIncluded={(name) =>
                    handleAddResearcher(
                        activeSite,
                        "includedResearchers",
                        name,
                    )}
                onRemoveIncluded={(name) =>
                    handleRemoveResearcher(
                        activeSite,
                        "includedResearchers",
                        name,
                    )}
                onAddExcluded={(name) =>
                    handleAddResearcher(
                        activeSite,
                        "excludedResearchers",
                        name,
                    )}
                onRemoveExcluded={(name) =>
                    handleRemoveResearcher(
                        activeSite,
                        "excludedResearchers",
                        name,
                    )}
            />
        {/if}

        <ProviderSettings
            telegram={settingsState.globals.providers.telegram ?? {
                enabled: false,
                botToken: "",
            }}
            idleThreshold={settingsState.globals.idleThreshold}
            onBotTokenChange={(token) =>
                handleQueueMutation("store-patch", {
                    namespace: "globals",
                    data: {
                        providers: {
                            telegram: {
                                botToken: token,
                            },
                        },
                    },
                })}
            onIdleThresholdChange={(minutes) =>
                handleQueueMutation("store-patch", {
                    namespace: "globals",
                    data: {
                        idleThreshold: minutes * 60,
                    },
                })}
            onTelegramToggle={() =>
                handleQueueMutation("store-patch", {
                    namespace: "globals",
                    data: {
                        providers: {
                            telegram: {
                                enabled:
                                    !settingsState.globals.providers.telegram
                                        ?.enabled,
                            },
                        },
                    },
                })}
        />

        <AutoReloadSettings
            value={activeSite.settings?.autoReload.enabled}
            minInterval={activeSite.settings?.autoReload.minInterval}
            maxInterval={activeSite.settings?.autoReload.maxInterval}
            onToggle={() =>
                handleQueueMutation("store-patch", {
                    namespace: "sites",
                    entry: activeSite.name,
                    data: {
                        autoReload: {
                            enabled: !activeSite.settings?.autoReload.enabled,
                        },
                    },
                })}
            onIntervalChange={(key, value) => {
                handleQueueMutation("store-patch", {
                    namespace: "sites",
                    entry: activeSite.name,
                    data: {
                        autoReload: {
                            [key]: value,
                        },
                    },
                });
            }}
        />

        <DebugSettings
            {activeSite}
            {settingsState}
            value={settingsState.globals.enableDebug}
            onToggle={() => {
                handleQueueMutation("store-patch", {
                    namespace: "globals",
                    data: {
                        enableDebug: !settingsState.globals.enableDebug,
                    },
                });
            }}
        />
    {/if}

    <ToastHost />
</div>
