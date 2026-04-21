<script lang="ts">
    import Subsection from "./Subsection.svelte";
    import type { Snippet } from "svelte";

    type Props = {
        label: string;
        id?: string;
        children?: Snippet;
    };

    let { label, id = "", children }: Props = $props();
</script>

<Subsection
    class="flex flex-col gap-1.5"
    borderClass="border-popup-border-subtle"
>
    <label for={id} class="text-xs font-medium text-popup-text-muted">
        {label}
    </label>
    {#if children}
        {@render children()}
    {/if}
</Subsection>
