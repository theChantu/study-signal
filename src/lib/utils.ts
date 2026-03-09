import store from "../store/store";
import {
    convertCurrencyEnhancement,
    highlightRatesEnhancement,
    newSurveyNotificationsEnhancement,
    surveyLinksEnhancement,
    uiEnhancement,
    updateRates,
} from "../features";

let debugEnabled = false;

async function initDebug() {
    const { enableDebug } = await store.get(["enableDebug"]);
    debugEnabled = enableDebug;
}

const log: typeof console.log = (...args) => {
    if (debugEnabled) console.log("[Prolific Enhancer]", ...args);
};

store.subscribe((changed) => {
    if ("enableDebug" in changed) {
        debugEnabled = changed.enableDebug!;
    }
});

function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function extractSymbol(text: string) {
    const m = text.match(/[£$€]/);
    return m ? m[0] : null;
}

function getRandomTimeoutMs() {
    // 3 - 5 minutes
    const MAX_TIMEOUT = 5;
    const MIN_TIMEOUT = 3;
    return (
        (Math.floor(Math.random() * (MAX_TIMEOUT - MIN_TIMEOUT)) +
            MIN_TIMEOUT) *
        60 *
        1000
    );
}

function scheduleTimeout(fn: () => void, delay = 300) {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const run = () => {
        timeout = setTimeout(() => {
            timeout = null;
            fn();
        }, delay);
    };

    return {
        start() {
            if (!timeout) run();
        },
        reset() {
            if (timeout) clearTimeout(timeout);
            run();
        },
        clear() {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        },
    };
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

async function runEnhancements() {
    log("Running enhancements...");
    const {
        enableCurrencyConversion,
        enableHighlightRates,
        enableSurveyLinks,
        enableNewSurveyNotifications,
        ui: { hidden },
    } = await store.get([
        "enableCurrencyConversion",
        "enableHighlightRates",
        "enableSurveyLinks",
        "enableNewSurveyNotifications",
        "ui",
    ]);

    await Promise.all([
        !enableCurrencyConversion && convertCurrencyEnhancement.revert(),
        !enableHighlightRates && highlightRatesEnhancement.revert(),
        !enableSurveyLinks && surveyLinksEnhancement.revert(),
        !enableNewSurveyNotifications &&
            newSurveyNotificationsEnhancement.revert(),
        hidden && uiEnhancement.revert(),
    ]);

    // Fetch the latest currency rates before conversion
    if (enableCurrencyConversion) {
        await updateRates();
    }

    // Currency conversion must happen first
    enableCurrencyConversion && (await convertCurrencyEnhancement.apply());

    await Promise.all([
        enableHighlightRates && highlightRatesEnhancement.apply(),
        enableSurveyLinks && surveyLinksEnhancement.apply(),
        enableNewSurveyNotifications &&
            newSurveyNotificationsEnhancement.apply(),
        !hidden && uiEnhancement.apply(),
    ]);
}

initDebug();
export {
    log,
    clamp,
    runEnhancements,
    extractSymbol,
    getRandomTimeoutMs,
    scheduleTimeout,
    capitalize,
};
