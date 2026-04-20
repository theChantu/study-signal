<script lang="ts">
    import type { Snippet } from "svelte";

    type Props = {
        withDivider?: boolean;
        borderClass?: string;
        className?: string;
        children?: Snippet;
    };

    let {
        withDivider = true,
        borderClass = "border-popup-border",
        className = "",
        children,
    }: Props = $props();
</script>

<div
    class={`mt-2.5 ${withDivider ? `pt-2.5 border-t ${borderClass}` : ""} ${className}`.trim()}
>
    {#if children}
        {@render children()}
    {/if}
</div>
