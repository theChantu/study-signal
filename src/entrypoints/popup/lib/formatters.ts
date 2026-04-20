export function formatValue(
    value: number | null,
    symbol: string | null,
): string {
    if (value === null) return "N/A";
    return `${symbol ?? ""}${value.toFixed(2)}`;
}

export function formatDuration(minutes: number | null): string | null {
    if (minutes === null || minutes < 0) return null;
    if (minutes === 0) return "0m";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    const parts: string[] = [];

    if (hours > 0) parts.push(`${hours}h`);
    if (remainingMinutes > 0) parts.push(`${remainingMinutes}m`);

    return parts.join(" ");
}
