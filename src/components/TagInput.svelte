<script lang="ts">
    import { X } from "@lucide/svelte";
    import Subsection from "./Subsection.svelte";

    export let title: string;
    export let values: string[];
    export let suggestions: string[] = [];
    export let placeholder: string = "Add...";
    export let onAdd: (value: string) => void;
    export let onRemove: (value: string) => void;
    export let clean: (value: string) => string = (v) => v.trim();

    let input = "";

    $: filtered =
        input.length > 0
            ? suggestions.filter(
                  (s) => s.includes(clean(input)) && !values.includes(s),
              )
            : [];

    function add(value: string) {
        const cleaned = clean(value);
        if (cleaned && !values.includes(cleaned)) {
            onAdd(cleaned);
        }
        input = "";
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && input.trim()) {
            e.preventDefault();
            if (filtered.length > 0) {
                add(filtered[0]);
            } else {
                add(input);
            }
        }
    }
</script>

<Subsection
    className="flex flex-col gap-1.5"
    borderClass="border-popup-border-subtle"
>
    <span class="text-xs font-medium text-popup-text-muted">{title}</span>
    {#if values.length > 0}
        <div class="flex flex-wrap gap-1">
            {#each values as value}
                <span
                    class="inline-flex items-center gap-1 rounded bg-popup-surface-subtle px-2 py-0.5 text-xs text-popup-text-soft"
                >
                    {value}
                    <button
                        class="inline-flex cursor-pointer items-center border-none bg-transparent p-0 leading-none text-popup-text-faint hover:text-popup-danger-text"
                        on:click={() => onRemove(value)}
                        aria-label="Remove {value}"
                    >
                        <X size={10} />
                    </button>
                </span>
            {/each}
        </div>
    {/if}
    <div class="relative">
        <input
            type="text"
            {placeholder}
            class="popup-control box-border placeholder:text-popup-text-faint"
            bind:value={input}
            on:keydown={handleKeydown}
        />
        {#if filtered.length > 0}
            <ul
                class="absolute top-full left-0 right-0 z-10 mt-1 max-h-35 list-none overflow-y-auto rounded-md border border-popup-border bg-popup-surface py-1 shadow-lg"
            >
                {#each filtered.slice(0, 5) as suggestion}
                    <li>
                        <button
                            class="block w-full cursor-pointer border-none bg-transparent px-2.5 py-1.5 text-left text-xs font-[inherit] text-popup-text-soft hover:bg-popup-surface-muted"
                            on:mousedown|preventDefault={() => add(suggestion)}
                        >
                            {suggestion}
                        </button>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</Subsection>
