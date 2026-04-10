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
        class="flex w-full cursor-pointer items-start justify-between gap-3 border-none bg-transparent px-3 py-2.5 text-left font-[inherit] transition-colors duration-150 hover:bg-white/4"
        type="button"
        onclick={toggle}
        aria-expanded={open}
    >
        <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
                <div
                    class={`text-sm font-medium leading-tight ${accent ? "text-indigo-100" : "text-gray-100"}`}
                >
                    {title}
                </div>
                {#if badge}
                    <span class="popup-badge">{badge}</span>
                {/if}
            </div>
            {#if description}
                <div
                    class={`mt-0.5 text-xs leading-snug ${accent ? "text-indigo-200/75" : "text-gray-400"}`}
                >
                    {description}
                </div>
            {/if}
        </div>
        <div
            class={`popup-chip-chevron mt-0.5 shrink-0 transition-transform duration-200 ${accent ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-200" : ""} ${open ? "rotate-180" : ""}`}
        >
            <ChevronDown size={12} strokeWidth={2.4} />
        </div>
    </button>

    {#if open && children}
        <div
            transition:slide={{ duration: 160 }}
            class="border-t border-white/6 px-3 py-2.5"
        >
            {@render children()}
        </div>
    {/if}
</div>
