<script lang="ts">
    import Toggle from "@/components/Toggle.svelte";

    import type { Snippet } from "svelte";

    type ToggleControlProps = {
        title: string;
        description: string;
        value: boolean;
        onClick: () => void;
        children?: Snippet;
    };

    let { title, description, value, onClick, children }: ToggleControlProps =
        $props();
</script>

<Toggle {title} {description} {value} {onClick} />
{#if value && children}
    {@render children()}
{/if}
