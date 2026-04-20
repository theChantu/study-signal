<script lang="ts">
    type Props = {
        items: string[];
        onSelect: (value: string) => void;
    };

    let { items, onSelect }: Props = $props();
</script>

{#if items.length > 0}
    <ul
        class="absolute top-full left-0 right-0 z-10 mt-1 max-h-35 list-none overflow-y-auto rounded-md border border-popup-border bg-popup-surface py-1 shadow-lg"
    >
        {#each items as item}
            <li>
                <button
                    class="block w-full cursor-pointer border-none bg-transparent px-2.5 py-1.5 text-left text-xs font-[inherit] text-popup-text-soft hover:bg-popup-surface-muted"
                    onmousedown={(e) => { e.preventDefault(); onSelect(item); }}
                >
                    {item}
                </button>
            </li>
        {/each}
    </ul>
{/if}
