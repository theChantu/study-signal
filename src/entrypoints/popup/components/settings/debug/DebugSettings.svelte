<script lang="ts">
    import ResetSettingsControls from "./ResetSettingsControls.svelte";
    import NotificationTestControls from "./NotificationTestControls.svelte";
    import { Bug } from "@lucide/svelte";
    import ToggleControl from "@/components/ToggleControl.svelte";
    import Section from "@/components/Section.svelte";

    import type {
        SettingComponentProps,
        ToggleControlComponentProps,
    } from "@/entrypoints/popup/types";

    let {
        activeSite,
        settingsState,
        value,
        onToggle,
    }: ToggleControlComponentProps & SettingComponentProps = $props();
</script>

<Section title="Developer" icon={Bug}>
    <ToggleControl
        title="Enable developer mode"
        description="Log extension activity to the browser console."
        {value}
        onClick={onToggle}
    >
        {#snippet children()}
            <ResetSettingsControls {activeSite} {settingsState} />
            <NotificationTestControls {activeSite} {settingsState} />
        {/snippet}
    </ToggleControl>
</Section>
