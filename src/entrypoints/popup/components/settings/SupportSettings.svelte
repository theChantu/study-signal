<script lang="ts">
    import { Heart } from "@lucide/svelte";

    const supportUrl = "https://ko-fi.com/thechantu";
</script>

<a
    href={supportUrl}
    target="_blank"
    rel="noopener noreferrer"
    class="group flex items-center gap-3 rounded-xl border border-pink-500/20 bg-pink-500/5 p-3 px-4 transition-colors hover:bg-pink-500/10"
>
    <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-500/15 text-pink-500"
    >
        <Heart size={16} strokeWidth={2.4} fill="currentColor" />
    </div>
    <div class="min-w-0 flex-1">
        <div class="text-sm font-semibold text-popup-text-strong">
            Support Study Signal
        </div>
        <p class="text-xs text-popup-text-muted">
            If this saves you time, consider supporting on Ko-fi
        </p>
    </div>
</a>
