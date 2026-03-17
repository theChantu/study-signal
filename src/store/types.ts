type Enhancement = {
    apply(): void;
    revert(): void;
};

type Currencies = "USD" | "GBP";

interface CurrencyConversionSettings {
    conversionRates: {
        timestamp: number;
        USD: { rates: Record<Currencies, number> };
        GBP: { rates: Record<Currencies, number> };
    };
    selectedCurrency: Currencies;
    enableCurrencyConversion: boolean;
}

interface HighlightRatesSettings {
    enableHighlightRates: boolean;
}

interface SurveyLinksSettings {
    enableSurveyLinks: boolean;
    surveys: Record<string, ReturnType<typeof Date.now>>;
}

type researcherName = string;

interface NewSurveyNotificationsSettings {
    cachedResearchers: Record<researcherName, ReturnType<typeof Date.now>>;
    excludedResearchers: researcherName[];
    includedResearchers: researcherName[];
    enableNewSurveyNotifications: boolean;
}

type SiteSettings = CurrencyConversionSettings &
    HighlightRatesSettings &
    SurveyLinksSettings &
    NewSurveyNotificationsSettings;

interface GlobalSettings {
    enableDebug: boolean;
}

export type {
    Enhancement,
    GlobalSettings,
    SiteSettings,
    Currencies,
    NewSurveyNotificationsSettings,
};
