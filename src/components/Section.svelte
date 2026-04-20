<script lang="ts">
    import type { Component, Snippet } from "svelte";

    type Props = {
        title: string;
        icon: Component<{ size: number; strokeWidth: number }>;
        tone?: "default" | "muted";
        children?: Snippet;
    };

    let { title, icon: Icon, tone = "default", children }: Props = $props();
</script>

<div class="border-t border-popup-border pt-3">
    <h2
        class={`popup-section-heading ${tone === "muted" ? "popup-section-heading-muted" : ""}`}
    >
        <Icon size={14} strokeWidth={2.5} />
        {title}
    </h2>
    {#if children}
        {@render children()}
    {/if}
</div>
