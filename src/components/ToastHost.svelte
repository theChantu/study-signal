<script lang="ts">
    import {
        dismissToast,
        pauseToast,
        resumeToast,
        runToastAction,
        toasts,
    } from "@/entrypoints/popup/toastStore";
</script>

<div
    class="pointer-events-none fixed right-3 bottom-3 z-50 flex w-[min(320px,calc(100vw-1.5rem))] flex-col gap-2"
>
    {#each $toasts as toast (toast.id)}
        <div
            class="pointer-events-auto flex items-center gap-2 rounded-md border border-popup-border bg-popup-surface px-3 py-2 text-xs leading-snug text-popup-text shadow-lg"
            role="alert"
            onmouseenter={() => pauseToast(toast.id)}
            onmouseleave={() => resumeToast(toast.id)}
        >
            <span class="min-w-0 flex-1">{toast.message}</span>

            {#if toast.actionLabel}
                <button
                    class="shrink-0 cursor-pointer rounded border-none bg-transparent p-0 text-xs font-semibold text-popup-accent-text transition-colors hover:text-popup-accent-text-strong"
                    onclick={() => runToastAction(toast.id)}
                >
                    {toast.actionLabel}
                </button>
            {/if}

            <button
                class="shrink-0 cursor-pointer rounded border-none bg-transparent p-0 text-sm leading-none text-popup-text-faint transition-colors hover:text-popup-text-soft"
                onclick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
            >
                ×
            </button>
        </div>
    {/each}
</div>
