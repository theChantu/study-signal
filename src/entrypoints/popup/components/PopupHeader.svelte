<script lang="ts">
    const version = browser.runtime.getManifest().version;
    const iconUrl = browser.runtime.getURL("/icon-32.png");
</script>

<div class="flex items-center gap-2.5">
    <img class="h-6 w-6 rounded-lg" src={iconUrl} alt="" />
    <span class="text-[15px] font-bold tracking-[-0.02em] text-popup-text-strong">
        Study Signal
    </span>
    <span class="text-[11px] text-popup-text-faint">v{version}</span>
</div>
