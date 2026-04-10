import type { SiteSettings } from "./types";

const defaultSiteSettings = Object.freeze({
    studyAlerts: {
        cache: {
            studies: {},
            researchers: {},
        },
        enabled: true,
        included: [],
        excluded: [],
    },
    autoReload: {
        enabled: false,
        minInterval: 5,
        maxInterval: 7,
    },
    analytics: {
        totalStudyCompletions: 0,
        bestDailyStudyCompletions: 0,
        previousDailyStudyCompletions: 0,
        dailyStudyCompletions: {
            timestamp: Date.now(),
            count: 0,
        },
    },
} as const satisfies SiteSettings);

const defaultSiteSettingsKeys = Object.keys(
    defaultSiteSettings,
) as (keyof typeof defaultSiteSettings)[];

export { defaultSiteSettings, defaultSiteSettingsKeys };
