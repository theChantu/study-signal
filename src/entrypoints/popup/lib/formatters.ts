export function formatValue(
    value: number | null,
    symbol: string | null,
): string {
    if (value === null) return "N/A";
    return `${symbol ?? ""}${value.toFixed(2)}`;
}

export function formatDuration(seconds: number | null): string | null {
    if (seconds === null || seconds < 0) return null;
    if (seconds === 0) return "0s";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    const parts: string[] = [];

    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);

    return parts.join(" ");
}
