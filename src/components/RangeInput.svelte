<script lang="ts">
    type Props = {
        label: string;
        min: number;
        max: number;
        step?: number;
        value: number;
        oninput?: (e: Event) => void;
        onchange?: (e: Event) => void;
        id?: string;
    };

    let {
        label,
        min,
        max,
        step = 1,
        value,
        oninput,
        onchange,
        id,
    }: Props = $props();
</script>

<label class="flex flex-col gap-1.5" for={id}>
    <span class="text-[11.5px] text-popup-text-muted">{label}</span>
    <input
        {id}
        type="range"
        {min}
        {max}
        {step}
        {value}
        {oninput}
        {onchange}
        class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-popup-border accent-popup-accent-text"
    />
</label>
