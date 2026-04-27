import BaseEnhancement from "./BaseEnhancement";
import { parseNumericValue } from "@/lib/parse/parseNumericValue";
import { getCurrency } from "@/lib/currency";
import { ensureConversionRates } from "@/lib/currency/rates";
import { rateToColor } from "@/lib/utils";
import { sendExtensionMessage } from "@/messages/sendExtensionMessage";
import { HIGHLIGHT_BASE_CURRENCY } from "@/constants";

import type { Currency } from "@/store/types";

class HighlightRatesEnhancement extends BaseEnhancement {
    async apply() {
        const { conversionRates, highlightRates } = this.settings;

        const rateElements = this.adapter.getHourlyRateElements();
        const sourceCurrencies = new Set<Currency>();

        for (const rateEl of rateElements) {
            const { originalSymbol } = this.adapter.getRewardState(rateEl);
            if (!originalSymbol) continue;

            const currency = getCurrency(originalSymbol);
            if (currency && currency !== HIGHLIGHT_BASE_CURRENCY) {
                sourceCurrencies.add(currency);
            }
        }

        const {
            conversionRates: updatedConversionRates,
            patch: conversionRatesPatch,
            updated,
        } = await ensureConversionRates(conversionRates, [...sourceCurrencies]);

        if (updated) {
            await sendExtensionMessage({
                type: "store-patch",
                data: {
                    namespace: "globals",
                    data: {
                        conversionRates: conversionRatesPatch,
                    },
                },
            });
        }

        for (const rateEl of rateElements) {
            // Check if the element should be ignored
            if (rateEl.classList.contains("se-rate-highlight")) {
                continue;
            }

            const { originalText, originalSymbol } =
                this.adapter.getRewardState(rateEl);

            const rate = parseNumericValue(originalText);
            if (rate === null || !originalSymbol) continue;

            const originalCurrency = getCurrency(originalSymbol);
            if (!originalCurrency) continue;

            const currencyToUsd =
                updatedConversionRates[originalCurrency].rates.USD;

            rateEl.style.backgroundColor = rateToColor(
                rate * currencyToUsd,
                highlightRates.min,
                highlightRates.max,
            );

            if (!rateEl.classList.contains("se-rate-highlight"))
                rateEl.classList.add("se-rate-highlight");
        }
    }
    async revert() {
        const elements =
            document.querySelectorAll<HTMLElement>(".se-rate-highlight");
        for (const el of elements) {
            if (!el) continue;
            el.style.backgroundColor = "";
            el.classList.remove("se-rate-highlight");
        }
    }
}

export { HighlightRatesEnhancement };
