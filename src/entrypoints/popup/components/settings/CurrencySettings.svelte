<script lang="ts">
    import { CircleDollarSign, ChevronDown } from "@lucide/svelte";
    import ToggleControl from "@/components/ToggleControl.svelte";
    import Section from "@/components/Section.svelte";
    import Field from "@/components/Field.svelte";
    import { currencyKeys } from "@/store/types";

    import type { ToggleControlComponentProps } from "../../types";
    import type { Currency } from "@/store/types";

    type CurrencySettingsProps = {
        selectedCurrency: Currency;
        onCurrencyChange: (currency: Currency) => void;
    };

    let {
        value,
        onToggle,
        selectedCurrency,
        onCurrencyChange,
    }: ToggleControlComponentProps & CurrencySettingsProps = $props();
</script>

<Section title="Currency" icon={CircleDollarSign}>
    <ToggleControl
        title="Enable Currency Conversion"
        description="Convert rewards into your selected currency."
        {value}
        onClick={onToggle}
    >
        {#snippet children()}
            <Field label="Selected currency" id="currency">
                <div class="relative text-gray-500">
                    <select
                        id="currency"
                        class="w-full py-2 pl-2.5 pr-8 rounded-md border border-white/8 bg-white/4 hover:bg-white/4 text-gray-300 text-[0.82rem] font-[inherit] outline-none appearance-none cursor-pointer focus:border-white/20 [&_option]:bg-[#1a1d21] [&_option]:text-gray-300"
                        bind:value={selectedCurrency}
                        onchange={(e) =>
                            onCurrencyChange(
                                (e.target as HTMLSelectElement)
                                    .value as Currency,
                            )}
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
        {/snippet}
    </ToggleControl>
</Section>
