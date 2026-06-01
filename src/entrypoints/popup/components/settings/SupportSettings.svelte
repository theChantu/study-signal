<script lang="ts">
    import { Coffee, Heart } from "@lucide/svelte";
    import Section from "@/components/Section.svelte";

    const supportUrl = "https://ko-fi.com/thechantu";
</script>

<Section title="Support" icon={Heart} tone="rose">
    <div
        class="flex flex-col gap-3.5 rounded-xl border border-popup-border bg-popup-surface p-4"
    >
        <div class="flex items-center gap-3">
            <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[oklch(0.62_0.21_0/0.1)] text-[oklch(0.62_0.21_0)] dark:bg-[oklch(0.62_0.21_0/0.16)]"
            >
                <Heart
                    size={20}
                    strokeWidth={2}
                    fill="currentColor"
                    aria-hidden="true"
                />
            </div>
            <div class="min-w-0">
                <h3
                    class="text-[13.5px] font-semibold leading-tight text-popup-text-strong"
                >
                    A tip, if you'd like
                </h3>
                <p
                    class="mt-0.5 text-[11.5px] leading-snug text-popup-text-muted"
                >
                    Your contribution will be felt deeply and briefly.
                </p>
            </div>
        </div>

        <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="flex w-full items-center justify-center gap-2 rounded-[10px] bg-[oklch(0.62_0.21_0)] px-3.5 py-2.75 text-[13.5px] font-semibold text-white no-underline transition-[filter,transform] duration-150 hover:-translate-y-px hover:brightness-105 active:translate-y-0"
        >
            <Coffee size={18} strokeWidth={2} aria-hidden="true" />
            Buy me a coffee
            <span class="sr-only">(opens in new tab)</span>
        </a>
    </div>
</Section>
