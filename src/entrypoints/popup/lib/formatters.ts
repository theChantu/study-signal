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

export function formatTimeAgo(timestamp: number): string {
    if (!timestamp) return "";
    const minutes = Math.round((Date.now() - timestamp) / 60_000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
