import { currencyKeysSet, type Currency } from "@/store/types";

function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function extractSymbol(text: string) {
    const m = text.match(/[£$€]/);
    return m ? m[0] : null;
}

function getRandomTimeoutMs(min: number, max: number): number {
    return (Math.floor(Math.random() * (max - min + 1)) + min) * 60 * 1000;
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
        setDelay(newDelay: number) {
            delay = newDelay;
            if (timeout) {
                clearTimeout(timeout);
                run();
            }
        },
    };
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function cleanResearcherName(name: string): string {
    return name.trim().toLowerCase();
}

const symbolToCurrency: Record<string, Currency> = {
    "£": "GBP",
    $: "USD",
    "€": "EUR",
};
function getCurrency(symbolOrCode: string): Currency | undefined {
    return (
        symbolToCurrency[symbolOrCode] ??
        (currencyKeysSet.has(symbolOrCode as Currency)
            ? (symbolOrCode as Currency)
            : undefined)
    );
}

export {
    clamp,
    cleanResearcherName,
    extractSymbol,
    getRandomTimeoutMs,
    scheduleTimeout,
    capitalize,
    getCurrency,
};
