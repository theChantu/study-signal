<script lang="ts">
    import { CircleDollarSign } from "@lucide/svelte";
    import SelectControl from "@/components/SelectControl.svelte";
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
                <SelectControl
                    id="currency"
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
                </SelectControl>
            </Field>
        {/snippet}
    </ToggleControl>
</Section>
