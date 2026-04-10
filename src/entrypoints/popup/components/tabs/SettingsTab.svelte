<script lang="ts">
    import { ChevronDown, LoaderCircle } from "@lucide/svelte";

    import {
        sites,
        supportedHosts,
        type SupportedHosts,
    } from "@/adapters/siteConfigs";
    import { capitalize } from "@/lib/utils";

    import AutoReloadSettings from "../settings/AutoReloadSettings.svelte";
    import CurrencySettings from "../settings/CurrencySettings.svelte";
    import DebugSettings from "../settings/debug/DebugSettings.svelte";
    import HighlightSettings from "../settings/HighlightSettings.svelte";
    import NotificationSettings from "../settings/NotificationSettings.svelte";
    import ProviderSettings from "../settings/ProviderSettings.svelte";
    import { queueMutation, selectHost } from "../../popupModel.svelte";
    import { settingsState } from "../../state.svelte";

    import type { SettingsTabModel } from "../../types";

    let { model }: { model: SettingsTabModel } = $props();

    let siteEnhancements = $derived(
        new Set(sites[model.activeSite.url].enhancements),
    );
</script>

<div class="flex min-h-0 flex-1 flex-col gap-4">
    <div class="shrink-0 px-4">
        <div class="relative text-gray-500">
            <select
                class="popup-select-control font-medium [&_option]:bg-[#1a1d21] [&_option]:text-gray-300"
                value={model.activeSite.url}
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

    <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
        {#if !model.activeSite.settings}
            <div
                class="border-t border-white/6 pt-3 p-8 flex items-center justify-center gap-2 text-gray-500 text-sm"
            >
                <LoaderCircle size={18} class="animate-spin text-indigo-400/60" />
                <span>Loading settings...</span>
            </div>
        {:else}
            {#if siteEnhancements.has("highlightRates")}
                <HighlightSettings
                    model={{
                        queueMutation,
                        siteName: model.activeSite.name,
                        highlightRates: settingsState.globals.highlightRates,
                    }}
                />
            {/if}

            {#if siteEnhancements.has("currency")}
                <CurrencySettings
                    model={{
                        queueMutation,
                        siteName: model.activeSite.name,
                        currency: settingsState.globals.currency,
                    }}
                />
            {/if}

            {#if siteEnhancements.has("studyAlerts")}
                <NotificationSettings
                    model={{
                        queueMutation,
                        siteName: model.activeSite.name,
                        studyAlerts: model.activeSite.settings.studyAlerts,
                        notifications: settingsState.globals.notifications,
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
                    siteName: model.activeSite.name,
                    autoReload: model.activeSite.settings.autoReload,
                }}
            />

            <DebugSettings
                model={{
                    queueMutation,
                    activeSite: model.activeSite,
                    settingsState: settingsState,
                }}
            />
        {/if}
    </div>
</div>
