<script lang="ts">
    import type { Snippet } from "svelte";

    type Props = {
        withDivider?: boolean;
        borderClass?: string;
        class?: string;
        children?: Snippet;
    };

    let {
        withDivider = true,
        borderClass = "border-popup-border",
        class: className = "",
        children,
    }: Props = $props();
</script>

<div
    class={["mt-2.5", withDivider && `border-t pt-2.5 ${borderClass}`, className]
        .filter(Boolean)
        .join(" ")}
>
    {#if children}
        {@render children()}
    {/if}
</div>
