<script lang="ts">
    import { ArrowUpRight } from "@lucide/svelte";

    import type { StudyItem } from "../types";

    let { item }: { item: StudyItem } = $props();

    const title = $derived(item.title ?? "Untitled study");
    const researcher = $derived(item.researcher ?? "Researcher unavailable");

    function formatValue(value: number | null): string {
        if (value === null) return "N/A";
        return `${item.symbol ?? ""}${value.toFixed(2)}`;
    }

    const reward = $derived(formatValue(item.reward));
    const rate = $derived(formatValue(item.rate));
    const accent = $derived(item.color ?? "rgb(100, 116, 139)");
    const cardStyle = $derived(`--accent: ${accent};`);
</script>

{#snippet cardContent()}
    <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
            <p class="truncate text-sm font-medium text-gray-100">
                {title}
            </p>
            <p class="mt-1 text-xs text-gray-500">
                {researcher}
                <span class="text-white/15">&middot;</span>
                {item.siteLabel}
            </p>
        </div>
    </div>

    <div class="mt-2 flex items-center gap-3 text-xs">
        <div>
            <span class="text-gray-500">Reward</span>
            <span class="ml-1.5 font-medium text-gray-200">{reward}</span>
        </div>
        <span
            class="rounded-md px-2 py-0.5 font-semibold"
            style="color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent);"
            >{rate}/hr</span
        >
    </div>
{/snippet}

{#if item.link}
    <a
        href={item.link}
        target="_blank"
        rel="noreferrer"
        class="popup-surface block border-l-5 p-3 transition-colors duration-150 hover:bg-white/6"
        style="{cardStyle} border-left-color: var(--accent);"
    >
        {@render cardContent()}
    </a>
{:else}
    <div
        class="popup-surface border-l-5 p-3"
        style="{cardStyle} border-left-color: var(--accent);"
    >
        {@render cardContent()}
    </div>
{/if}
