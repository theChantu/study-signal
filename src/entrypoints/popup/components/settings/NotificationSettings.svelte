<script lang="ts">
    import { Bell } from "@lucide/svelte";
    import ToggleControl from "@/components/ToggleControl.svelte";
    import Section from "@/components/Section.svelte";
    import { cleanResearcherName } from "@/lib/utils";
    import TagInput from "@/components/TagInput.svelte";
    import type { NewSurveyNotificationsSettings } from "@/store/types";

    import type { NotificationSettingsModel } from "../../types";

    let { model }: { model: NotificationSettingsModel } = $props();

    type ResearcherKey = Exclude<
        keyof NewSurveyNotificationsSettings,
        "surveys" | "cachedResearchers"
    >;

    function handleToggle() {
        void model.queueMutation("store-patch", {
            namespace: "sites",
            entry: model.siteName,
            data: {
                newSurveyNotifications: {
                    enabled: !model.newSurveyNotifications.enabled,
                },
            },
        });
    }

    function handleAddResearcher(key: ResearcherKey, name: string) {
        if (model.newSurveyNotifications[key].includes(name)) return;

        void model.queueMutation("store-patch", {
            namespace: "sites",
            entry: model.siteName,
            data: {
                newSurveyNotifications: {
                    [key]: [...model.newSurveyNotifications[key], name],
                },
            },
        });
    }

    function handleRemoveResearcher(key: ResearcherKey, name: string) {
        void model.queueMutation("store-patch", {
            namespace: "sites",
            entry: model.siteName,
            data: {
                newSurveyNotifications: {
                    [key]: model.newSurveyNotifications[key].filter(
                        (candidate) => candidate !== name,
                    ),
                },
            },
        });
    }
</script>

<Section title="Alerts" icon={Bell}>
    <ToggleControl
        title="New survey alerts"
        description="Get notified when a new survey shows up."
        value={model.newSurveyNotifications.enabled}
        onClick={handleToggle}
    >
        {#snippet children()}
            <TagInput
                title="Included researchers"
                values={model.newSurveyNotifications.includedResearchers}
                suggestions={Object.keys(
                    model.newSurveyNotifications.cachedResearchers,
                )}
                placeholder="Add researcher..."
                clean={cleanResearcherName}
                onAdd={(name) =>
                    handleAddResearcher("includedResearchers", name)}
                onRemove={(name) =>
                    handleRemoveResearcher("includedResearchers", name)}
            />
            <TagInput
                title="Excluded researchers"
                values={model.newSurveyNotifications.excludedResearchers}
                suggestions={Object.keys(
                    model.newSurveyNotifications.cachedResearchers,
                )}
                placeholder="Add researcher..."
                clean={cleanResearcherName}
                onAdd={(name) =>
                    handleAddResearcher("excludedResearchers", name)}
                onRemove={(name) =>
                    handleRemoveResearcher("excludedResearchers", name)}
            />
        {/snippet}
    </ToggleControl>
</Section>
