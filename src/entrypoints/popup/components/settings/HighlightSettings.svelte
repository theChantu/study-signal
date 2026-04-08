<script lang="ts">
    import { Highlighter } from "@lucide/svelte";
    import ToggleControl from "@/components/ToggleControl.svelte";
    import Section from "@/components/Section.svelte";

    import type { HighlightSettingsModel } from "../../types";

    let { model }: { model: HighlightSettingsModel } = $props();

    function handleToggle() {
        void model.queueMutation("store-patch", {
            namespace: "sites",
            entry: model.siteName,
            data: {
                highlightRates: {
                    enabled: !model.highlightRates.enabled,
                },
            },
        });
    }
</script>

<Section title="Highlights" icon={Highlighter}>
    <ToggleControl
        title="Rate highlights"
        description="Make stronger survey rates easier to spot."
        value={model.highlightRates.enabled}
        onClick={handleToggle}
    ></ToggleControl>
</Section>
