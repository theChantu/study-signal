import store from "../store/store";
import { CONVERSION_RATES_FETCH_INTERVAL_MS } from "../constants";
import BaseEnhancement from "./BaseEnhancement";
import extractHourlyRate from "@/lib/extractHourlyRate";
import { getCurrency } from "@/lib/utils";
import { sendExtensionMessage } from "@/messages/sendExtensionMessage";
import {
    currencyKeysSet,
    type SiteSettings,
    type Currency,
    type ExchangeRatesResponse,
} from "../store/types";

type ConversionRates = SiteSettings["conversionRates"];
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
    conversionRates: ConversionRates,
    currency: Currency,
) {
    const clonedConversionRates = structuredClone(conversionRates);

    try {
        const data = await sendExtensionMessage({
            type: "fetch",
            data: { url: `https://open.er-api.com/v6/latest/${currency}` },
        });
        if (!isExchangeRatesResponse(data)) {
            throw new Error("Invalid exchange rates response");
        }

        const { base_code, rates } = data;

        for (const [k, v] of Object.entries(rates) as [Currency, number][]) {
            clonedConversionRates[base_code].rates[k] = v;
        }
    } catch (error) {
        console.error(error);
    }

    return clonedConversionRates as ConversionRates;
}

function getSymbol(currency: Currency) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
    })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value;
}

class ConvertCurrencyEnhancement extends BaseEnhancement {
    async apply() {
        const { selectedCurrency, conversionRates } = await store.get(
            this.adapter.url.name,
            ["selectedCurrency", "conversionRates"],
        );
        await this.updateRates(conversionRates, selectedCurrency);

        const elements = this.adapter.getRewardElements();

        const selectedSymbol = getSymbol(selectedCurrency);

        for (const element of elements) {
            let sourceHtml = element.getAttribute("data-original-html");
            let sourceText = element.getAttribute("data-original-text");

            if (!sourceText || !sourceHtml) {
                element.setAttribute("data-original-text", element.textContent);
                element.setAttribute("data-original-html", element.innerHTML);
                sourceText = element.textContent;
                sourceHtml = element.innerHTML;
                const sourceSymbol = this.adapter.getInitCurrencyInfo(element);

                element.setAttribute("source", sourceSymbol ?? "");
            }

            const { sourceSymbol, displaySymbol } =
                this.adapter.getCurrencyInfo(element);

            if (sourceSymbol === selectedSymbol) {
                // Selected symbol matches source, so revert element text
                if (element.innerHTML !== sourceHtml) {
                    element.innerHTML = sourceHtml;
                }

                element.setAttribute("display", sourceSymbol ?? "");
                continue;
            }

            element.setAttribute("display", selectedSymbol ?? "");

            // Continue if currency is already converted
            if (displaySymbol === selectedSymbol || !sourceSymbol) continue;

            const sourceCurrency = getCurrency(sourceSymbol);
            if (!sourceCurrency) continue;

            const rate =
                conversionRates[sourceCurrency].rates[selectedCurrency];
            const elementRate = extractHourlyRate(sourceText);
            const converted = `${selectedSymbol}${(elementRate * rate).toFixed(2)}`;

            element.textContent = sourceText.replace(
                /[$£€]?\s*\d+(?:\.\d+)?/,
                converted,
            );
        }
    }

    private async updateRates(
        conversionRates: ConversionRates,
        selectedCurrency: Currency,
    ) {
        const now = Date.now();

        if (
            now - conversionRates[selectedCurrency].timestamp <
            CONVERSION_RATES_FETCH_INTERVAL_MS
        )
            return;

        const newConversionRates = await fetchRates(
            conversionRates,
            selectedCurrency,
        );
        newConversionRates[selectedCurrency].timestamp = now;

        await store.set(this.adapter.url.name, {
            conversionRates: newConversionRates,
        });
    }

    async revert() {
        document.querySelectorAll("[data-original-text]").forEach((el) => {
            el.innerHTML = el.getAttribute("data-original-html") || "";
            el.removeAttribute("data-original-text");
            el.removeAttribute("data-original-html");
            el.removeAttribute("display");
            el.removeAttribute("source");
        });
    }
}

const convertCurrencyEnhancement = new ConvertCurrencyEnhancement();

export { convertCurrencyEnhancement };
