<script lang="ts">
    import { onMount } from "svelte";
    import {
        sites,
        supportedHosts,
        type SupportedHosts,
    } from "@/adapters/siteConfigs";
    import ToastHost from "@/components/ToastHost.svelte";
    import { ChevronDown, LoaderCircle } from "@lucide/svelte";
    import { capitalize } from "@/lib/utils";
    import { settingsState, uiState } from "./state.svelte";
    import {
        initPopup,
        queueMutation,
        selectHost,
    } from "./popupModel.svelte";
    import DebugSettings from "./components/settings/debug/DebugSettings.svelte";
    import HighlightSettings from "./components/settings/HighlightSettings.svelte";
    import AutoReloadSettings from "./components/settings/AutoReloadSettings.svelte";
    import ProviderSettings from "./components/settings/ProviderSettings.svelte";
    import CurrencySettings from "./components/settings/CurrencySettings.svelte";
    import NotificationSettings from "./components/settings/NotificationSettings.svelte";
    import Analytics from "./components/Analytics.svelte";
    import type { ActiveSiteState } from "./types";

    onMount(initPopup);

    const activeSite: ActiveSiteState = $derived({
        url: uiState.selectedHost,
        name: sites[uiState.selectedHost].name,
        settings: settingsState.sites[uiState.selectedHost],
    });

    const siteEnhancements = $derived(
        new Set(sites[activeSite.url].enhancements),
    );

    const siteSettings = $derived(activeSite.settings);
</script>

<div class="p-4 flex flex-col gap-4">
    <div>
        <div class="relative text-gray-500">
            <select
                class="popup-select-control font-medium [&_option]:bg-[#1a1d21] [&_option]:text-gray-300"
                value={activeSite.url}
                onchange={(e) =>
                    selectHost(e.currentTarget.value as SupportedHosts)}
            >
                {#each supportedHosts as url}
                    <option value={url}>
                        {capitalize(sites[url].name)}
                    </option>
                {/each}
            </select>
            <div class="popup-control-chevron">
                <ChevronDown size={12} strokeWidth={2.4} />
            </div>
        </div>
    </div>

    {#if !siteSettings}
        <div
            class="border-t border-white/6 pt-3 p-8 flex items-center justify-center gap-2 text-gray-500 text-[0.82rem]"
        >
            <LoaderCircle size={18} class="animate-spin" />
            <span>Loading settings...</span>
        </div>
    {:else}
        <Analytics model={siteSettings.analytics} />
        {#if siteEnhancements.has("highlightRates")}
            <HighlightSettings
                model={{
                    queueMutation,
                    siteName: activeSite.name,
                    highlightRates: siteSettings.highlightRates,
                }}
            />
        {/if}

        {#if siteEnhancements.has("currencyConversion")}
            <CurrencySettings
                model={{
                    queueMutation,
                    siteName: activeSite.name,
                    currencyConversion: siteSettings.currencyConversion,
                }}
            />
        {/if}

        {#if siteEnhancements.has("newSurveyNotifications")}
            <NotificationSettings
                model={{
                    queueMutation,
                    siteName: activeSite.name,
                    newSurveyNotifications: siteSettings.newSurveyNotifications,
                }}
            />
        {/if}

        <ProviderSettings
            model={{
                queueMutation,
                idleThreshold: settingsState.globals.idleThreshold,
                providers: settingsState.globals.providers,
            }}
        />
        <AutoReloadSettings
            model={{
                queueMutation,
                siteName: activeSite.name,
                autoReload: siteSettings.autoReload,
            }}
        />
        <DebugSettings
            model={{
                queueMutation,
                activeSite,
                settingsState,
            }}
        />
    {/if}

    <ToastHost />
</div>
