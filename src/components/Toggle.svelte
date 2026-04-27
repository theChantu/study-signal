<script lang="ts">
    type Props = {
        title: string;
        description: string;
        value: boolean;
        onClick: () => void;
    };

    let { title, description, value, onClick }: Props = $props();
</script>

<label
    class="flex cursor-pointer items-center justify-between gap-4 border-b border-popup-border py-2.5"
>
    <div class="min-w-0">
        <div class="text-[13px] font-medium leading-tight text-popup-text">
            {title}
        </div>
        <div class="mt-0.5 text-[11.5px] leading-snug text-popup-text-muted">
            {description}
        </div>
    </div>
    <button
        type="button"
        class="relative h-5 w-9 shrink-0 cursor-pointer rounded-[10px] border-none p-0 transition-all duration-150 hover:brightness-110 hover:scale-105 {value
            ? 'bg-popup-accent-text'
            : 'bg-popup-text-faint'}"
        onclick={onClick}
        role="switch"
        aria-checked={value}
        aria-label={title}
    >
        <span
            class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 {value
                ? 'translate-x-4'
                : ''}"
        ></span>
    </button>
</label>
