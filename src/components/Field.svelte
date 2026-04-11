<script lang="ts">
    import Subsection from "./Subsection.svelte";

    export let label: string;
    export let id: string = "";
</script>

<Subsection
    className="flex flex-col gap-1.5"
    borderClass="border-popup-border-subtle"
>
    <label for={id} class="text-xs font-medium text-popup-text-muted">
        {label}
    </label>
    <slot />
</Subsection>
