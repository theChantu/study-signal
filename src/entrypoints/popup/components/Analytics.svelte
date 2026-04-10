<script lang="ts">
    import { ChartColumn } from "@lucide/svelte";
    import Collapsible from "@/components/Collapsible.svelte";
    import Section from "@/components/Section.svelte";

    import type { AnalyticsModel } from "../types";

    let { model }: { model: AnalyticsModel } = $props();

    const todayCount = $derived(model.dailyStudyCompletions.count);
    const bestCount = $derived(model.bestDailyStudyCompletions);
    const previousCount = $derived(model.previousDailyStudyCompletions);
    const matchingBestDay = $derived(
        todayCount > 0 && todayCount === bestCount,
    );

    function pluralize(count: number, noun: string) {
        return `${count} ${noun}${count === 1 ? "" : "s"}`;
    }

    const analyticsSummary = $derived.by(() => {
        if (todayCount === 0) {
            return "Complete a study to start today's count.";
        }

        if (bestCount > 0 && todayCount === bestCount) {
            if (previousCount > 0 && todayCount > previousCount) {
                return `Matching your best day and ${pluralize(todayCount - previousCount, "completion")} ahead of your last active day.`;
            }

            return "Matching your best day.";
        }

        if (previousCount > 0 && todayCount > previousCount) {
            return `${pluralize(todayCount - previousCount, "completion")} ahead of your last active day.`;
        }

        if (bestCount > todayCount) {
            return `${pluralize(bestCount - todayCount, "completion")} away from your best day.`;
        }

        return "Analytics update automatically as completions are tracked.";
    });
</script>

<Section title="Stats" icon={ChartColumn}>
    <Collapsible
        title="Today's progress"
        description={analyticsSummary}
        defaultOpen={matchingBestDay}
    >
        {#snippet children()}
            <div class="divide-y divide-white/6">
                <div class="flex items-center justify-between py-2">
                    <span
                        class={`text-xs ${matchingBestDay ? "popup-analytics-accent" : "text-gray-400"}`}
                        >Completed today</span
                    >
                    <span
                        class={`text-lg font-semibold ${matchingBestDay ? "popup-analytics-accent" : "text-gray-100"}`}
                    >
                        {todayCount}
                    </span>
                </div>

                <div class="flex items-center justify-between py-2">
                    <span class="text-xs text-gray-400">Best day</span>
                    <span class="text-lg font-semibold text-gray-200">
                        {bestCount}
                    </span>
                </div>

                <div class="flex items-center justify-between py-2">
                    <span class="text-xs text-gray-400">Last active day</span>
                    <span class="text-lg font-semibold text-gray-300">
                        {previousCount}
                    </span>
                </div>

                <div class="flex items-center justify-between py-2">
                    <span class="text-xs text-gray-400">Total completed</span>
                    <span class="text-lg font-semibold text-gray-300">
                        {model.totalStudyCompletions}
                    </span>
                </div>
            </div>
        {/snippet}
    </Collapsible>
</Section>
