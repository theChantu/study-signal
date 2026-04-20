<script lang="ts">
    import { ChevronDown } from "@lucide/svelte";
    import type { Snippet } from "svelte";
    import type { HTMLSelectAttributes } from "svelte/elements";

    type Props = Omit<HTMLSelectAttributes, "value"> & {
        children: Snippet;
        value?: HTMLSelectAttributes["value"];
        variant?: "default" | "sm";
    };

    let {
        children,
        class: className,
        value = $bindable(),
        variant = "default",
        ...rest
    }: Props = $props();
</script>

<div class="relative text-popup-text-faint">
    <select
        class={`popup-select-control ${variant === "sm" ? "py-1 pr-6 pl-2 text-xs" : ""} ${className ?? ""}`.trim()}
        bind:value
        {...rest}
    >
        {@render children()}
    </select>
    {#if variant === "sm"}
        <div
            class="pointer-events-none absolute top-1/2 right-1.5 -translate-y-1/2 text-popup-text-faint"
        >
            <ChevronDown size={10} strokeWidth={2.4} />
        </div>
    {:else}
        <div class="popup-control-chevron">
            <ChevronDown size={12} strokeWidth={2.4} />
        </div>
    {/if}
</div>
