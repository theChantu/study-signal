<script lang="ts">
    import { Highlighter } from "@lucide/svelte";
    import ToggleControl from "@/components/ToggleControl.svelte";
    import Section from "@/components/Section.svelte";
    import { cleanResearcherName } from "@/lib/utils";
    import { SiteSettings } from "@/store/types";
    import TagInput from "@/components/TagInput.svelte";

    import type { ToggleControlComponentProps } from "../../types";

    type NotificationSettingsProps = {
        newNotifications: SiteSettings["newSurveyNotifications"];
        onAddIncluded: (name: string) => void;
        onRemoveIncluded: (name: string) => void;
        onAddExcluded: (name: string) => void;
        onRemoveExcluded: (name: string) => void;
    };

    let props: ToggleControlComponentProps & NotificationSettingsProps =
        $props();
</script>

<Section title="Notifications" icon={Highlighter}>
    <ToggleControl
        title="Enable Notifications"
        description="Send a desktop notification when a new survey appears."
        value={props.value}
        onClick={props.onToggle}
    >
        {#snippet children()}
            <TagInput
                title="Included researchers"
                values={props.newNotifications?.includedResearchers}
                suggestions={Object.keys(
                    props.newNotifications?.cachedResearchers,
                )}
                placeholder="Add researcher..."
                clean={cleanResearcherName}
                onAdd={(name) => props.onAddIncluded(name)}
                onRemove={(name) => props.onRemoveIncluded(name)}
            />
            <TagInput
                title="Excluded researchers"
                values={props.newNotifications?.excludedResearchers}
                suggestions={Object.keys(
                    props.newNotifications?.cachedResearchers,
                )}
                placeholder="Add researcher..."
                clean={cleanResearcherName}
                onAdd={(name) => props.onAddExcluded(name)}
                onRemove={(name) => props.onRemoveExcluded(name)}
            />
        {/snippet}
    </ToggleControl>
</Section>
