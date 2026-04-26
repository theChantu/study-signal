<script lang="ts">
    import { ChevronDown } from "@lucide/svelte";
    import { slide } from "svelte/transition";

    import type { Snippet } from "svelte";

    type CollapsibleProps = {
        title: string;
        description?: string;
        defaultOpen?: boolean;
        accent?: boolean;
        badge?: string;
        children: Snippet;
    };

    let {
        title,
        description,
        defaultOpen = false,
        accent = false,
        badge,
        children,
    }: CollapsibleProps = $props();

    let loaded = false;
    let open = $state(false);

    $effect(() => {
        if (!loaded) {
            open = defaultOpen;
            loaded = true;
        }
    });

    function toggle() {
        open = !open;
    }
</script>

<div class={`popup-collapsible overflow-hidden ${accent ? "popup-collapsible-accent" : ""}`}>
    <button
        class="flex w-full cursor-pointer items-start justify-between gap-3 border-none bg-transparent px-3 py-2.5 text-left font-[inherit] transition-colors duration-150 hover:bg-popup-surface-muted"
        type="button"
        onclick={toggle}
        aria-expanded={open}
    >
        <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
                <div
                    class={`text-sm font-medium leading-tight ${accent ? "text-popup-accent-text-strong" : "text-popup-text-strong"}`}
                >
                    {title}
                </div>
                {#if badge}
                    <span class="popup-badge">{badge}</span>
                {/if}
            </div>
            {#if description}
                <div
                    class={`mt-0.5 text-xs leading-snug ${accent ? "text-popup-accent-text-muted" : "text-popup-text-muted"}`}
                >
                    {description}
                </div>
            {/if}
        </div>
        <div
            class={`popup-chip-chevron mt-0.5 shrink-0 transition-transform duration-200 ${accent ? "border-popup-accent-border bg-popup-accent-surface text-popup-accent-text-soft" : ""} ${open ? "rotate-180" : ""}`}
        >
            <ChevronDown size={12} strokeWidth={2.4} />
        </div>
    </button>

    {#if open && children}
        <div
            transition:slide={{ duration: 150 }}
            class="border-t border-popup-border px-3 py-2.5"
        >
            {@render children()}
        </div>
    {/if}
</div>
