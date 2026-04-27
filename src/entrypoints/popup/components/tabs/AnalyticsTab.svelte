<script lang="ts">
    import { sites, supportedHosts } from "@/adapters/siteConfigs";
    import { capitalize } from "@/lib/utils";

    import type { AnalyticsTabModel } from "../../types";
    import type { SiteSettings } from "@/store/types";

    let { model }: { model: AnalyticsTabModel } = $props();

    type Analytics = SiteSettings["analytics"];

    type PlatformAnalytics = {
        host: (typeof supportedHosts)[number];
        label: string;
        analytics: Analytics;
    };

    const platformAnalytics = $derived.by((): PlatformAnalytics[] =>
        supportedHosts.flatMap((host) => {
            const analytics = model.sites[host]?.analytics;
            if (!analytics) return [];

            return [
                {
                    host,
                    label: capitalize(sites[host].name),
                    analytics,
                },
            ];
        }),
    );

    const totals = $derived.by(() => {
        return platformAnalytics.reduce(
            (total, platform) => ({
                today:
                    total.today +
                    platform.analytics.dailyStudyCompletions.count,
                allTime:
                    total.allTime + platform.analytics.totalStudyCompletions,
                bestDay: Math.max(
                    total.bestDay,
                    platform.analytics.bestDailyStudyCompletions,
                ),
                previous:
                    total.previous +
                    platform.analytics.previousDailyStudyCompletions,
            }),
            {
                today: 0,
                allTime: 0,
                bestDay: 0,
                previous: 0,
            },
        );
    });

    const diffFromYesterday = $derived(totals.today - totals.previous);

    const diffClass = $derived(
        diffFromYesterday > 0
            ? "bg-popup-good-bg text-popup-good"
            : diffFromYesterday < 0
              ? "bg-popup-danger-surface text-popup-danger-text"
              : "bg-popup-tag-bg text-popup-text-muted",
    );

    function formatCount(count: number): string {
        return count.toLocaleString();
    }

    function platformPercent(total: number): number {
        if (totals.allTime === 0) return 0;
        return Math.round((total / totals.allTime) * 100);
    }
</script>

<div
    class="popup-settings-list flex min-h-0 flex-1 flex-col gap-4.5 overflow-y-auto pl-5 pr-1 pb-4 [scrollbar-gutter:stable]"
>
    <section>
        <h2
            class="mb-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-popup-text-faint"
        >
            All platforms
        </h2>

        <div class="grid grid-cols-3 gap-2">
            <div
                class="rounded-[10px] border border-popup-border bg-popup-surface px-3.5 py-3"
            >
                <div class="text-[10.5px] font-medium text-popup-text-muted">
                    Today
                </div>
                <div
                    class="mt-1 text-[22px] font-bold leading-none tracking-[-0.02em] text-popup-text-strong"
                >
                    {formatCount(totals.today)}
                </div>
            </div>
            <div
                class="rounded-[10px] border border-popup-border bg-popup-surface px-3.5 py-3"
            >
                <div class="text-[10.5px] font-medium text-popup-text-muted">
                    All time
                </div>
                <div
                    class="mt-1 text-[22px] font-bold leading-none tracking-[-0.02em] text-popup-text-strong"
                >
                    {formatCount(totals.allTime)}
                </div>
            </div>
            <div
                class="rounded-[10px] border border-popup-border bg-popup-surface px-3.5 py-3"
            >
                <div class="text-[10.5px] font-medium text-popup-text-muted">
                    Best day
                </div>
                <div
                    class="mt-1 text-[22px] font-bold leading-none tracking-[-0.02em] text-popup-text-strong"
                >
                    {formatCount(totals.bestDay)}
                </div>
            </div>
        </div>

        <div
            class="mt-3 flex items-center justify-between rounded-[10px] border border-popup-border bg-popup-surface px-3.5 py-3"
        >
            <div>
                <div class="text-xs font-semibold text-popup-text-strong">
                    vs. yesterday
                </div>
                <div class="text-[11px] text-popup-text-muted">
                    {formatCount(totals.previous)} completions
                </div>
            </div>

            <div
                class={`rounded-lg px-2.5 py-1 text-[13px] font-bold ${diffClass}}`}
            >
                {diffFromYesterday > 0 ? "+" : ""}{diffFromYesterday}
            </div>
        </div>
    </section>

    <section>
        <h2
            class="mb-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-popup-text-faint"
        >
            By platform
        </h2>

        {#if platformAnalytics.length === 0}
            <div
                class="rounded-[10px] border border-popup-border bg-popup-surface px-3.5 py-3 text-center text-xs text-popup-text-muted"
            >
                Analytics will appear after settings finish loading.
            </div>
        {:else}
            <div class="flex flex-col gap-1.5">
                {#each platformAnalytics as platform (platform.host)}
                    {@const percent = platformPercent(
                        platform.analytics.totalStudyCompletions,
                    )}
                    <div
                        class="flex items-center gap-3 rounded-[10px] border border-popup-border bg-popup-surface px-3.5 py-2.5"
                    >
                        <div class="min-w-0 flex-1">
                            <div
                                class="text-[12.5px] font-semibold text-popup-text-strong"
                            >
                                {platform.label}
                            </div>
                            <div class="mt-1 flex items-center gap-1.5">
                                <div
                                    class="h-0.75 flex-1 overflow-hidden rounded-sm bg-popup-tag-bg"
                                >
                                    <div
                                        class="h-full rounded-sm bg-popup-accent-text opacity-60"
                                        style={`width: ${percent}%;`}
                                    ></div>
                                </div>
                                <span
                                    class="shrink-0 text-[9.5px] font-medium text-popup-text-faint"
                                >
                                    {percent}%
                                </span>
                            </div>
                        </div>

                        <div class="min-w-9 shrink-0 text-right">
                            <div
                                class="text-base font-bold leading-none text-popup-text-strong"
                            >
                                {formatCount(
                                    platform.analytics.dailyStudyCompletions
                                        .count,
                                )}
                            </div>
                            <div
                                class="mt-0.5 text-[9px] font-medium text-popup-text-faint"
                            >
                                today
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </section>
</div>
