<script lang="ts">
    export let title: string;
    export let description: string;
    export let value: boolean;
    export let onClick: () => void;
</script>

<label class="flex cursor-pointer items-center justify-between gap-4 border-t border-popup-border-subtle py-2">
    <div class="min-w-0">
        <div class="text-sm font-medium leading-tight text-popup-text">{title}</div>
        <div class="mt-0.5 text-xs leading-snug text-popup-text-muted">{description}</div>
    </div>
    <button
        class="relative h-5 w-9 shrink-0 cursor-pointer rounded-full border-none p-0 transition-colors duration-150 {value ? 'bg-popup-accent-text' : 'bg-popup-border'}"
        on:click={onClick}
        role="switch"
        aria-checked={value}
        aria-label={title}
    >
        <span
            class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-popup-surface shadow-sm transition-transform duration-150 {value ? 'translate-x-4' : ''}"
        ></span>
    </button>
</label>
