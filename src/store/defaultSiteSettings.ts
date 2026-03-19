import { currencyKeys } from "./types";

import type { SiteSettings, Currency } from "./types";

const conversionRates: SiteSettings["conversionRates"] = {
    ...(Object.fromEntries(
        currencyKeys.map((baseCurrency) => [
            baseCurrency,
            {
                timestamp: 0,
                rates: Object.fromEntries(
                    currencyKeys.map((targetCurrency) => [targetCurrency, 1]),
                ) as Record<Currency, number>,
            },
        ]),
    ) as Record<
        Currency,
        { timestamp: number; rates: Record<Currency, number> }
    >),
};

const defaultSiteSettings: SiteSettings = Object.freeze({
    conversionRates,
    selectedCurrency: "USD",
    enableCurrencyConversion: true,
    enableHighlightRates: true,
    enableSurveyLinks: true,
    enableNewSurveyNotifications: true,
    surveys: {},
    cachedResearchers: {},
    excludedResearchers: [],
    includedResearchers: [],
    minReloadInterval: 5,
    maxReloadInterval: 7,
    enableAutoReload: false,
});

export { defaultSiteSettings };
