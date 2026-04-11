<script lang="ts">
    export let withDivider = true;
    export let borderClass = "border-popup-border";
    export let className = "";
</script>

<div
    class={`mt-2.5 ${withDivider ? `pt-2.5 border-t ${borderClass}` : ""} ${className}`.trim()}
>
    <slot />
</div>
