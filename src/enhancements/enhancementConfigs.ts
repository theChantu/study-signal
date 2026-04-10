import {
    ConvertCurrencyEnhancement,
    HighlightRatesEnhancement,
    NotificationsEnhancement,
} from "../enhancements";
import BaseEnhancement from "./BaseEnhancement";

type EnhancementClass = new (...args: any[]) => BaseEnhancement;

type EnhancementConfig = {
    enhancement: EnhancementClass;
    priority: boolean;
};

const enhancementKeys = ["currency", "highlightRates", "studyAlerts"] as const;

export type EnhancementKey = (typeof enhancementKeys)[number];

export const enhancementConfigs = {
    currency: {
        enhancement: ConvertCurrencyEnhancement,
        priority: true,
    },
    highlightRates: {
        enhancement: HighlightRatesEnhancement,
        priority: false,
    },

    studyAlerts: {
        enhancement: NotificationsEnhancement,
        priority: false,
    },
} as const satisfies Record<EnhancementKey, EnhancementConfig>;
