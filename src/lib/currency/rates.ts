import { CONVERSION_RATES_FETCH_INTERVAL_MS } from "@/constants";
import { sendExtensionMessage } from "@/messages/sendExtensionMessage";
import { currencyKeysSet } from "@/store/types";

import type {
    Currency,
    ExchangeRatesResponse,
    GlobalSettings,
} from "@/store/types";

type ConversionRates = GlobalSettings["conversionRates"];
type ConversionRatesPatch = Partial<ConversionRates>;

type FetchRatesResult = {
    baseCode: Currency;
    rates: Record<Currency, number>;
};

function isExchangeRatesResponse(
    value: unknown,
): value is ExchangeRatesResponse {
    if (!value || typeof value !== "object") return false;

    const data = value as Record<string, unknown>;

    if (data.result !== "success" && data.result !== "error") return false;
    if (typeof data.base_code !== "string") return false;
    if (!currencyKeysSet.has(data.base_code as Currency)) return false;

    if (!data.rates || typeof data.rates !== "object") return false;

    const rates = data.rates as Record<string, unknown>;

    for (const code of currencyKeysSet) {
        if (typeof rates[code] !== "number") {
            return false;
        }
    }

    return true;
}

async function fetchRates(
    currency: Currency,
): Promise<FetchRatesResult | null> {
    try {
        const data = await sendExtensionMessage({
            type: "fetch",
            data: { url: `https://open.er-api.com/v6/latest/${currency}` },
        });
        if (!isExchangeRatesResponse(data)) {
            throw new Error("Invalid exchange rates response");
        }

        return {
            baseCode: data.base_code,
            rates: data.rates as Record<Currency, number>,
        };
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function ensureConversionRates(
    conversionRates: ConversionRates,
    currencies: Currency[],
): Promise<{
    conversionRates: ConversionRates;
    patch: ConversionRatesPatch;
    updated: boolean;
}> {
    const now = Date.now();
    let updated = false;
    const rates = structuredClone(conversionRates);
    const patch: ConversionRatesPatch = {};

    for (const currency of new Set(currencies)) {
        if (
            now - rates[currency].timestamp <
            CONVERSION_RATES_FETCH_INTERVAL_MS
        ) {
            continue;
        }

        const result = await fetchRates(currency);
        if (!result) {
            continue;
        }

        rates[result.baseCode] = {
            timestamp: now,
            rates: result.rates,
        };
        patch[result.baseCode] = rates[result.baseCode];
        updated = true;
    }

    return { conversionRates: rates, patch, updated };
}
