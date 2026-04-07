<script lang="ts">
    import { onMount } from "svelte";
    import {
        defaultGlobalSettings,
        defaultGlobalSettingsKeys,
    } from "@/store/defaultGlobalSettings";
    import { sites, type SupportedHosts } from "@/adapters/siteConfigs";
    import { sendExtensionMessage } from "@/messages/sendExtensionMessage";
    import Toggle from "@/components/Toggle.svelte";
    import Section from "@/components/Section.svelte";
    import Field from "@/components/Field.svelte";
    import Subsection from "@/components/Subsection.svelte";
    import TagInput from "@/components/TagInput.svelte";
    import ToastHost from "@/components/ToastHost.svelte";
    import {
        Settings as SettingsIcon,
        CircleDollarSign,
        ChevronDown,
        Bell,
        Bug,
        LoaderCircle,
        RefreshCw,
        Send,
    } from "@lucide/svelte";
    import { capitalize, cleanResearcherName } from "@/lib/utils";
    import { currencyKeys } from "@/store/types";
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
    import {
        formatKey,
        handleResetGlobalKey,
        handleResetSiteKey,
    } from "./handlers/handleResetKey";

    import type { SiteSettings } from "@/store/types";
    import type {
        SiteResetKey,
        GlobalResetKey,
        ActiveSiteState,
    } from "./types";
    import { handleTestNotification } from "./handlers/handleTestNotification";

    const siteUrls = Object.keys(sites) as SupportedHosts[];

    const testNotificationModes = ["auto", "provider", "browser"] as const;

    const providerSetupUrl =
        "https://github.com/theChantu/survey-enhancer#provider-setup";

    const resettableGlobalKeys = Object.keys(defaultGlobalSettings).filter(
        (k) => k in defaultGlobalSettings && k !== "enableDebug",
    ) as GlobalResetKey[];
    const resettableSiteKeys = Object.keys(
        defaultSiteSettings,
    ) as SiteResetKey[];

    const activeSite: ActiveSiteState = $derived({
        url: uiState.selectedHost,
        name: sites[uiState.selectedHost].name,
        settings: settingsState.sites[uiState.selectedHost],
    });

    function parsePositiveInt(raw: string): number | null {
        const value = Number(raw);
        if (!Number.isFinite(value) || value < 1) return null;
        return Math.round(value);
    }

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
        {#if siteEnhancements.has("surveyLinks") || siteEnhancements.has("highlightRates")}
            <Section title="General" icon={SettingsIcon}>
                {#if siteEnhancements.has("surveyLinks")}
                    <Toggle
                        title="Survey links"
                        description="Show direct survey links when available."
                        value={activeSite.settings?.surveyLinks.enabled}
                        onClick={() =>
                            handleQueueMutation("store-patch", {
                                namespace: "sites",
                                entry: activeSite.name,
                                data: {
                                    surveyLinks: {
                                        enabled:
                                            !activeSite.settings?.surveyLinks
                                                .enabled,
                                    },
                                },
                            })}
                    />
                {/if}

                {#if siteEnhancements.has("highlightRates")}
                    <Toggle
                        title="Highlight rates"
                        description="Visually emphasize stronger survey rates."
                        value={activeSite.settings?.highlightRates.enabled}
                        onClick={() =>
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
            </Section>
        {/if}

        {#if siteEnhancements.has("currencyConversion")}
            <Section title="Currency" icon={CircleDollarSign}>
                <Toggle
                    title="Currency conversion"
                    description="Convert rewards into your selected currency."
                    value={activeSite.settings?.currencyConversion.enabled}
                    onClick={() =>
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
                />
                <Field label="Selected currency" id="currency">
                    <div class="relative text-gray-500">
                        <select
                            id="currency"
                            class="w-full py-2 pl-2.5 pr-8 rounded-md border border-white/8 bg-white/4 hover:bg-white/4 text-gray-300 text-[0.82rem] font-[inherit] outline-none appearance-none cursor-pointer focus:border-white/20 [&_option]:bg-[#1a1d21] [&_option]:text-gray-300"
                            bind:value={
                                activeSite.settings.currencyConversion
                                    .selectedCurrency
                            }
                            onchange={(e) =>
                                handleQueueMutation("store-patch", {
                                    namespace: "sites",
                                    entry: activeSite.name,
                                    data: {
                                        currencyConversion: {
                                            selectedCurrency: e.currentTarget
                                                .value as SiteSettings["currencyConversion"]["selectedCurrency"],
                                        },
                                    },
                                })}
                        >
                            {#each currencyKeys as currency}
                                <option value={currency}>{currency}</option>
                            {/each}
                        </select>
                        <div
                            class="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        >
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </Field>
            </Section>
        {/if}

        {#if siteEnhancements.has("newSurveyNotifications")}
            <Section title="Notifications" icon={Bell}>
                <Toggle
                    title="New survey notifications"
                    description="Send a desktop notification when a new survey appears."
                    value={activeSite.settings?.newSurveyNotifications.enabled}
                    onClick={() =>
                        handleQueueMutation("store-patch", {
                            namespace: "sites",
                            entry: activeSite.name,
                            data: {
                                newSurveyNotifications: {
                                    enabled:
                                        !activeSite.settings
                                            ?.newSurveyNotifications.enabled,
                                },
                            },
                        })}
                />
                {#if activeSite.settings?.newSurveyNotifications.enabled}
                    <TagInput
                        title="Included researchers"
                        values={activeSite.settings?.newSurveyNotifications
                            .includedResearchers}
                        suggestions={Object.keys(
                            activeSite.settings?.newSurveyNotifications
                                .cachedResearchers,
                        )}
                        placeholder="Add researcher..."
                        clean={cleanResearcherName}
                        onAdd={(name) =>
                            handleAddResearcher(
                                activeSite,
                                "includedResearchers",
                                name,
                            )}
                        onRemove={(name) =>
                            handleRemoveResearcher(
                                activeSite,
                                "includedResearchers",
                                name,
                            )}
                    />
                    <TagInput
                        title="Excluded researchers"
                        values={activeSite.settings?.newSurveyNotifications
                            .excludedResearchers}
                        suggestions={Object.keys(
                            activeSite.settings?.newSurveyNotifications
                                .cachedResearchers,
                        )}
                        placeholder="Add researcher..."
                        clean={cleanResearcherName}
                        onAdd={(name) =>
                            handleAddResearcher(
                                activeSite,
                                "excludedResearchers",
                                name,
                            )}
                        onRemove={(name) =>
                            handleRemoveResearcher(
                                activeSite,
                                "excludedResearchers",
                                name,
                            )}
                    />
                {/if}
            </Section>
        {/if}

        <Section title="Providers" icon={Send}>
            <div class="mb-2 text-[0.74rem] text-gray-500">
                Need help with bot setup?
                <a
                    href={providerSetupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="ml-1 text-indigo-300 hover:text-indigo-200"
                    >View setup guide</a
                >
            </div>

            <Field label="Idle threshold (minutes)" id="idle-threshold">
                <input
                    id="idle-threshold"
                    type="number"
                    min="1"
                    step="1"
                    class="w-full py-2 px-2.5 rounded-md border border-white/8 bg-white/4 text-gray-300 text-[0.82rem] font-[inherit] outline-none box-border focus:border-white/20"
                    value={Math.max(
                        1,
                        Math.round(settingsState.globals.idleThreshold / 60),
                    )}
                    onchange={(e) => {
                        const minutes = parsePositiveInt(e.currentTarget.value);
                        if (minutes === null) return;
                        handleQueueMutation("store-patch", {
                            namespace: "globals",
                            data: {
                                idleThreshold: minutes * 60,
                            },
                        });
                    }}
                />
            </Field>

            <Subsection withDivider={false}>
                <Toggle
                    title="Telegram"
                    description="Send notifications via Telegram bot when idle."
                    value={settingsState.globals.providers.telegram?.enabled ??
                        false}
                    onClick={() =>
                        handleQueueMutation("store-patch", {
                            namespace: "globals",
                            data: {
                                providers: {
                                    telegram: {
                                        enabled:
                                            !settingsState.globals.providers
                                                .telegram?.enabled,
                                    },
                                },
                            },
                        })}
                />
                {#if settingsState.globals.providers.telegram?.enabled}
                    <Field label="Bot token" id="telegram-bot-token">
                        <input
                            id="telegram-bot-token"
                            type="password"
                            class="w-full py-2 px-2.5 rounded-md border border-white/8 bg-white/4 text-gray-300 text-[0.82rem] font-[inherit] outline-none box-border focus:border-white/20"
                            value={settingsState.globals.providers.telegram
                                ?.botToken ?? ""}
                            onchange={(e) =>
                                handleQueueMutation("store-patch", {
                                    namespace: "globals",
                                    data: {
                                        providers: {
                                            telegram: {
                                                botToken: e.currentTarget.value,
                                            },
                                        },
                                    },
                                })}
                        />
                    </Field>
                {/if}
            </Subsection>
        </Section>

        <Section title="Auto Reload" icon={RefreshCw}>
            <Toggle
                title="Auto reload"
                description="Periodically refresh the page in the background to check for new studies."
                value={activeSite.settings?.autoReload.enabled}
                onClick={() =>
                    handleQueueMutation("store-patch", {
                        namespace: "sites",
                        entry: activeSite.name,
                        data: {
                            autoReload: {
                                enabled:
                                    !activeSite.settings?.autoReload.enabled,
                            },
                        },
                    })}
            />
            {#if activeSite.settings?.autoReload.enabled}
                <Field label="Min interval (minutes)" id="min-interval">
                    <input
                        id="min-interval"
                        type="number"
                        min="1"
                        step="1"
                        class="w-full py-2 px-2.5 rounded-md border border-white/8 bg-white/4 text-gray-300 text-[0.82rem] font-[inherit] outline-none box-border focus:border-white/20"
                        value={activeSite.settings?.autoReload.minInterval}
                        onchange={(e) => {
                            const minutes = parsePositiveInt(
                                e.currentTarget.value,
                            );
                            if (minutes === null) return;
                            handleQueueMutation("store-patch", {
                                namespace: "sites",
                                entry: activeSite.name,
                                data: {
                                    autoReload: {
                                        minInterval: minutes,
                                    },
                                },
                            });
                        }}
                    />
                </Field>
                <Field label="Max interval (minutes)" id="max-interval">
                    <input
                        id="max-interval"
                        type="number"
                        min="1"
                        step="1"
                        class="w-full py-2 px-2.5 rounded-md border border-white/8 bg-white/4 text-gray-300 text-[0.82rem] font-[inherit] outline-none box-border focus:border-white/20"
                        value={activeSite.settings?.autoReload.maxInterval}
                        onchange={(e) => {
                            const minutes = parsePositiveInt(
                                e.currentTarget.value,
                            );
                            if (minutes === null) return;
                            handleQueueMutation("store-patch", {
                                namespace: "sites",
                                entry: activeSite.name,
                                data: {
                                    autoReload: {
                                        maxInterval: minutes,
                                    },
                                },
                            });
                        }}
                    />
                </Field>
            {/if}
        </Section>

        <Section title="Developer" icon={Bug}>
            <Toggle
                title="Debug mode"
                description="Log extension activity to the browser console."
                value={settingsState.globals.enableDebug}
                onClick={() =>
                    handleQueueMutation("store-patch", {
                        namespace: "globals",
                        data: {
                            enableDebug: !settingsState.globals.enableDebug,
                        },
                    })}
            />

            {#if settingsState.globals.enableDebug}
                <Subsection
                    className="flex flex-col gap-2"
                    borderClass="border-white/4"
                >
                    <span class="text-[0.78rem] font-medium text-gray-500"
                        >Reset to default</span
                    >
                    <div class="flex flex-wrap gap-1">
                        {#each resettableGlobalKeys as key}
                            <button
                                class="py-1 px-2 rounded border border-white/8 bg-white/4 text-gray-300 text-[0.72rem] font-[inherit] cursor-pointer hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-300"
                                onclick={() =>
                                    handleResetGlobalKey(
                                        $state.snapshot(settingsState.globals),
                                        key,
                                    )}
                            >
                                {formatKey(key)}
                            </button>
                        {/each}
                        {#each resettableSiteKeys as key}
                            <button
                                class="py-1 px-2 rounded border border-white/8 bg-white/4 text-gray-300 text-[0.72rem] font-[inherit] cursor-pointer hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-300"
                                onclick={() =>
                                    handleResetSiteKey(
                                        $state.snapshot(activeSite),
                                        key,
                                    )}
                            >
                                {formatKey(key)}
                            </button>
                        {/each}
                    </div>
                </Subsection>
                <Subsection
                    className="flex flex-col gap-2"
                    borderClass="border-white/4"
                >
                    <div class="flex flex-col gap-0.5">
                        <span class="text-[0.78rem] font-medium text-gray-300"
                            >Test notifications</span
                        >
                        <span class="text-[0.72rem] text-gray-500">
                            Send a sample notification to verify routing and
                            provider setup.
                        </span>
                    </div>
                    <div class="grid grid-cols-3 gap-1.5">
                        {#each testNotificationModes as mode}
                            <button
                                class="py-1.5 px-2 rounded border border-white/10 bg-white/4 text-gray-200 text-[0.72rem] font-medium font-[inherit] cursor-pointer hover:bg-white/8 hover:border-white/20"
                                onclick={() =>
                                    handleTestNotification(activeSite, mode)}
                            >
                                {capitalize(mode)}
                            </button>
                        {/each}
                    </div>
                </Subsection>
            {/if}
        </Section>
    {/if}

    <ToastHost />
</div>
