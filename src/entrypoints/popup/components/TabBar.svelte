<script lang="ts">
    import { supportedHosts } from "@/adapters/siteConfigs";
    import { capitalize } from "@/lib/utils";
    import { runtimeState, uiState } from "../state.svelte";

    import type { PopupTab } from "../types";

    const tabs = ["studies", "settings"] as const satisfies PopupTab[];

    const studyCount = $derived(
        supportedHosts.reduce((sum, host) => {
            const studies = runtimeState.studies[host];
            return sum + (Array.isArray(studies) ? studies.length : 0);
        }, 0),
    );
</script>

<div class="popup-surface grid grid-cols-2 gap-1 p-1">
    {#each tabs as tab}
        <button
            type="button"
            class={`cursor-pointer rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                uiState.selectedTab === tab
                    ? "bg-indigo-500/15 text-indigo-200"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
            }`}
            onclick={() => (uiState.selectedTab = tab)}
        >
            {capitalize(tab)}
            {#if tab === "studies" && studyCount > 0}
                <span
                    class="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-xs font-semibold leading-none text-indigo-300"
                >
                    {studyCount}
                </span>
            {/if}
        </button>
    {/each}
</div>
