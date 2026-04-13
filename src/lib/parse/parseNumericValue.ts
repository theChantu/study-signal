export function parseNumericValue(text: string): number | null {
    const match = text.match(/[\d.]+/);
    if (!match) return null;

    const value = parseFloat(match[0]);
    return Number.isFinite(value) ? value : null;
}
