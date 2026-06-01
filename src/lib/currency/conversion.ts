import { getCurrency, getCurrencySymbol } from "./index";

import type { Currency, GlobalSettings } from "@/store/types";
import type { OpportunityInfo, StudyInfo } from "@/adapters/BaseAdapter";

export type ConversionRates = GlobalSettings["conversionRates"];

export interface CurrencyContext {
    enabled: boolean;
    target: Currency;
    conversionRates: ConversionRates;
}

type StudyValues = Pick<StudyInfo, "reward" | "rate" | "symbol">;

export function getConversionRate(
    source: Currency,
    target: Currency,
    conversionRates: ConversionRates,
): number | null {
    if (source === target) return 1;
    return conversionRates[source]?.rates[target] ?? null;
}

export function convertStudyValues(
    study: StudyValues,
    { enabled, target, conversionRates }: CurrencyContext,
): StudyValues {
    const fallback = {
        reward: study.reward,
        rate: study.rate,
        symbol: study.symbol,
    };

    if (!enabled || !study.symbol) return fallback;

    const source = getCurrency(study.symbol);
    if (!source) return fallback;

    const targetSymbol = getCurrencySymbol(target) ?? study.symbol;
    if (source === target) {
        return { reward: study.reward, rate: study.rate, symbol: targetSymbol };
    }

    const sourceRates = conversionRates[source];
    if (!sourceRates || sourceRates.timestamp === 0) return fallback;

    const rate = sourceRates.rates[target];
    if (!rate) return fallback;

    return {
        reward: study.reward === null ? null : study.reward * rate,
        rate: study.rate === null ? null : study.rate * rate,
        symbol: targetSymbol,
    };
}

function roundToDisplay(value: number | null): number | null {
    return value === null ? null : Math.round(value * 100) / 100;
}

export function getMatchableOpportunity(
    opportunity: OpportunityInfo,
    context: CurrencyContext,
): OpportunityInfo {
    if (opportunity.kind !== "study") return opportunity;

    const converted = convertStudyValues(opportunity, context);

    return {
        ...opportunity,
        reward: roundToDisplay(converted.reward),
        rate: roundToDisplay(converted.rate),
        symbol: converted.symbol,
    };
}
