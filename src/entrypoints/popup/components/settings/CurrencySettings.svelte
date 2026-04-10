<script lang="ts">
    import { CircleDollarSign, ChevronDown } from "@lucide/svelte";
    import ToggleControl from "@/components/ToggleControl.svelte";
    import Section from "@/components/Section.svelte";
    import Field from "@/components/Field.svelte";
    import { currencyKeys } from "@/store/types";

    import type { Currency } from "@/store/types";
    import type { CurrencySettingsModel } from "../../types";

    let { model }: { model: CurrencySettingsModel } = $props();

    function handleToggle() {
        void model.queueMutation("store-patch", {
            namespace: "globals",
            data: {
                currency: {
                    enabled: !model.currency.enabled,
                },
            },
        });
    }

    function handleCurrencyChange(currency: Currency) {
        void model.queueMutation("store-patch", {
            namespace: "globals",
            data: {
                currency: {
                    target: currency,
                },
            },
        });
    }
</script>

<Section title="Currency" icon={CircleDollarSign}>
    <ToggleControl
        title="Currency conversion"
        description="Show rewards in your preferred currency."
        value={model.currency.enabled}
        onClick={handleToggle}
    >
        {#snippet children()}
            <Field label="Selected currency" id="currency">
                <div class="relative text-gray-500">
                    <select
                        id="currency"
                        class="popup-select-control [&_option]:bg-[#1a1d21] [&_option]:text-gray-300"
                        bind:value={model.currency.target}
                        onchange={(e) =>
                            handleCurrencyChange(
                                (e.target as HTMLSelectElement)
                                    .value as Currency,
                            )}
                    >
                        {#each currencyKeys as currency}
                            <option value={currency}>{currency}</option>
                        {/each}
                    </select>
                    <div class="popup-control-chevron">
                        <ChevronDown size={12} strokeWidth={2.4} />
                    </div>
                </div>
            </Field>
        {/snippet}
    </ToggleControl>
</Section>
