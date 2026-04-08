<script lang="ts">
    import { Highlighter } from "@lucide/svelte";
    import ToggleControl from "@/components/ToggleControl.svelte";
    import Section from "@/components/Section.svelte";

    import type { ToggleControlComponentProps } from "../../types";

    let { value, onToggle }: ToggleControlComponentProps = $props();
</script>

<Section title="Rate Highlights" icon={Highlighter}>
    <ToggleControl
        title="Enable Highlights"
        description="Visually emphasize stronger survey rates."
        {value}
        onClick={onToggle}
    ></ToggleControl>
</Section>
