<script lang="ts">
    import { Send } from "@lucide/svelte";
    import ToggleControl from "@/components/ToggleControl.svelte";
    import Section from "@/components/Section.svelte";
    import Subsection from "@/components/Subsection.svelte";
    import { parsePositiveInt } from "@/lib/parse/parsePositiveInt";
    import Field from "@/components/Field.svelte";

    import type { ProviderSettingsModel } from "../../types";

    let { model }: { model: ProviderSettingsModel } = $props();

    const providerSetupUrl =
        "https://github.com/theChantu/study-signal#provider-setup";

    function handleIdleThresholdChange(minutes: number) {
        void model.queueMutation("store-patch", {
            namespace: "globals",
            data: {
                idleThreshold: minutes * 60,
            },
        });
    }

    function handleTelegramToggle() {
        const telegram = model.providers.telegram;

        void model.queueMutation("store-patch", {
            namespace: "globals",
            data: {
                providers: {
                    telegram: {
                        enabled: !(telegram?.enabled ?? false),
                        botToken: telegram?.botToken ?? "",
                        onlyWhenIdle: telegram?.onlyWhenIdle ?? true,
                    },
                },
            },
        });
    }

    function handleTelegramIdleToggle() {
        void model.queueMutation("store-patch", {
            namespace: "globals",
            data: {
                providers: {
                    telegram: {
                        onlyWhenIdle: !(
                            model.providers.telegram?.onlyWhenIdle ?? false
                        ),
                    },
                },
            },
        });
    }

    function handleBotTokenChange(token: string) {
        void model.queueMutation("store-patch", {
            namespace: "globals",
            data: {
                providers: {
                    telegram: {
                        botToken: token,
                    },
                },
            },
        });
    }
</script>

<Section title="Delivery" icon={Send}>
    <div class="mb-2 text-xs text-popup-text-muted">
        Need help getting Telegram set up?
        <a
            href={providerSetupUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="popup-inline-link ml-1">Open the setup guide</a
        >
    </div>
    <Subsection withDivider={false}>
        <ToggleControl
            title="Telegram alerts"
            description="Send matching alerts through Telegram."
            value={model.providers.telegram?.enabled ?? false}
            onClick={handleTelegramToggle}
        >
            {#snippet children()}
                <ToggleControl
                    title="Only when idle"
                    description="Use Telegram only when the browser reports you are away."
                    value={model.providers.telegram?.onlyWhenIdle ?? false}
                    onClick={handleTelegramIdleToggle}
                >
                    {#snippet children()}
                        <Field
                            label="Idle threshold (minutes)"
                            id="idle-threshold"
                        >
                            <input
                                id="idle-threshold"
                                type="number"
                                min="1"
                                step="1"
                                class="popup-control box-border"
                                value={Math.max(
                                    1,
                                    Math.round(model.idleThreshold / 60),
                                )}
                                onchange={(e) => {
                                    const minutes = parsePositiveInt(
                                        e.currentTarget.value,
                                    );
                                    if (minutes === null) return;
                                    handleIdleThresholdChange(minutes);
                                }}
                            />
                        </Field>
                    {/snippet}
                </ToggleControl>
                <Field label="Bot token" id="telegram-bot-token">
                    <input
                        id="telegram-bot-token"
                        type="password"
                        class="popup-control box-border"
                        value={model.providers.telegram?.botToken ?? ""}
                        onchange={(e) => {
                            handleBotTokenChange(
                                (e.target as HTMLInputElement).value,
                            );
                        }}
                    />
                </Field>
            {/snippet}
        </ToggleControl>
    </Subsection>
</Section>
