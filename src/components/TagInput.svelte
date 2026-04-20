<script lang="ts">
    import { X } from "@lucide/svelte";
    import SuggestionList from "./SuggestionList.svelte";
    import Subsection from "./Subsection.svelte";

    type Props = {
        title: string;
        values: string[];
        suggestions?: string[];
        placeholder?: string;
        onAdd: (value: string) => void;
        onRemove: (value: string) => void;
        clean?: (value: string) => string;
    };

    let {
        title,
        values,
        suggestions = [],
        placeholder = "Add...",
        onAdd,
        onRemove,
        clean = (v: string) => v.trim(),
    }: Props = $props();

    let input = $state("");

    let filtered = $derived(
        input.length > 0
            ? suggestions.filter(
                  (s) => s.includes(clean(input)) && !values.includes(s),
              )
            : [],
    );

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
                        onclick={() => onRemove(value)}
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
            onkeydown={handleKeydown}
        />
        <SuggestionList items={filtered.slice(0, 5)} onSelect={add} />
    </div>
</Subsection>
