export function parsePositiveInt(raw: string): number | null {
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 1) return null;
    return Math.round(value);
}
