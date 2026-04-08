<script lang="ts">
    import { RefreshCw } from "@lucide/svelte";
    import ToggleControl from "@/components/ToggleControl.svelte";
    import Section from "@/components/Section.svelte";
    import { parsePositiveInt } from "@/lib/parsePositiveInt";
    import Field from "@/components/Field.svelte";

    import type { ToggleControlComponentProps } from "../../types";
    import type { SiteSettings } from "@/store/types";

    type intervalSettings = Exclude<
        keyof SiteSettings["autoReload"],
        "enabled"
    >;

    type AutoReloadSettingsProps = ToggleControlComponentProps & {
        minInterval: number;
        maxInterval: number;
        onIntervalChange: (key: intervalSettings, value: number) => void;
    };

    let {
        value,
        onToggle,
        minInterval,
        maxInterval,
        onIntervalChange,
    }: AutoReloadSettingsProps = $props();
</script>

<Section title="Auto reload" icon={RefreshCw}>
    <ToggleControl
        title="Enable auto reload"
        description="Periodically refresh the page in the background to check for new studies."
        {value}
        onClick={onToggle}
    >
        {#snippet children()}
            <Field label="Min interval (minutes)" id="min-interval">
                <input
                    id="min-interval"
                    type="number"
                    min="1"
                    step="1"
                    class="w-full py-2 px-2.5 rounded-md border border-white/8 bg-white/4 text-gray-300 text-[0.82rem] font-[inherit] outline-none box-border focus:border-white/20"
                    value={minInterval}
                    onchange={(e) => {
                        const minutes = parsePositiveInt(e.currentTarget.value);
                        if (minutes === null) return;
                        onIntervalChange("minInterval", minutes);
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
                    value={maxInterval}
                    onchange={(e) => {
                        const minutes = parsePositiveInt(e.currentTarget.value);
                        if (minutes === null) return;
                        onIntervalChange("maxInterval", minutes);
                    }}
                />
            </Field>
        {/snippet}
    </ToggleControl>
</Section>
