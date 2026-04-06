import deepMerge from "@/lib/deepMerge";
import { defaultSiteSettings } from "./defaultSiteSettings";

import type { SiteSettings, DeepPartial } from "./types";

export type SiteNormalizationResult = {
    current: SiteSettings;
    persistedPatch?: DeepPartial<SiteSettings>;
};

type SiteNormalizationRule = (current: SiteSettings) => SiteNormalizationResult;

function normalizeDailySurveyCompletions(
    current: SiteSettings,
): SiteNormalizationResult {
    const daily = current.analytics.dailySurveyCompletions;
    const stale = Date.now() - daily.timestamp > 24 * 60 * 60 * 1000;
    if (!stale) return { current };

    const resetDaily = structuredClone(
        defaultSiteSettings.analytics.dailySurveyCompletions,
    );

    return {
        current: {
            ...current,
            analytics: {
                ...current.analytics,
                dailySurveyCompletions: resetDaily,
            },
        },
        persistedPatch: {
            analytics: {
                dailySurveyCompletions: resetDaily,
            },
        },
    };
}

const siteNormalizationRules: SiteNormalizationRule[] = [
    normalizeDailySurveyCompletions,
];

export function normalizeSiteState(
    current: SiteSettings,
): SiteNormalizationResult {
    let next = current;
    let persistedPatch: DeepPartial<SiteSettings> | undefined;

    for (const normalize of siteNormalizationRules) {
        const result = normalize(next);
        next = result.current;

        if (result.persistedPatch) {
            persistedPatch = persistedPatch
                ? (deepMerge(
                      persistedPatch,
                      result.persistedPatch,
                  ) as DeepPartial<SiteSettings>)
                : result.persistedPatch;
        }
    }

    return persistedPatch
        ? { current: next, persistedPatch }
        : { current: next };
}
