const DURATION_TOKEN =
    /(\d+(?:\.\d+)?)\s*(hours?|hrs?|hr|h|minutes?|mins?|min|m|seconds?|secs?|sec|s)\b/gi;

function normalizeUnit(unit: string): number | null {
    if (/^h(?:ours?|rs?|r)?$/.test(unit)) return 60 * 60;
    if (/^m(?:in(?:utes?)?|ins?)?$/.test(unit)) return 60;
    if (/^s(?:ec(?:onds?)?|ecs?)?$/.test(unit)) return 1;
    return null;
}

function normalizeText(text: string): string {
    return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function parseDurationSeconds(text: string | null): number | null {
    if (!text) return null;

    const normalized = normalizeText(text);
    let totalSeconds = 0;
    let foundToken = false;

    for (const match of normalized.matchAll(DURATION_TOKEN)) {
        const value = Number(match[1]);
        const unitSeconds = normalizeUnit(match[2]);
        if (!Number.isFinite(value) || unitSeconds === null) continue;

        totalSeconds += value * unitSeconds;
        foundToken = true;
    }

    return foundToken ? totalSeconds : null;
}
