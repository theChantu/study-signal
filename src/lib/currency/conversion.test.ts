import { describe, expect, it } from "vitest";
import {
    convertStudyValues,
    getConversionRate,
    getMatchableOpportunity,
    type ConversionRates,
    type CurrencyContext,
} from "./conversion";

import type { ProjectInfo, StudyInfo } from "@/adapters/BaseAdapter";

const conversionRates = {
    GBP: { timestamp: 1, rates: { USD: 1.3, GBP: 1 } },
    USD: { timestamp: 1, rates: { USD: 1, GBP: 0.77 } },
} as unknown as ConversionRates;

const enabledUsd: CurrencyContext = {
    enabled: true,
    target: "USD",
    conversionRates,
};

function study(values: Partial<StudyInfo> = {}): StudyInfo {
    return {
        id: "1",
        kind: "study",
        title: "Study",
        link: null,
        researcher: null,
        reward: 10,
        rate: 12,
        symbol: "£",
        devices: [],
        peripherals: [],
        averageCompletionMinutes: null,
        slots: null,
        ...values,
    };
}

describe("getConversionRate", () => {
    it("returns 1 for the same currency", () => {
        expect(getConversionRate("USD", "USD", conversionRates)).toBe(1);
    });

    it("looks up a stored cross-currency rate", () => {
        expect(getConversionRate("GBP", "USD", conversionRates)).toBe(1.3);
    });

    it("returns null when the pair is missing", () => {
        expect(getConversionRate("GBP", "EUR", conversionRates)).toBeNull();
    });
});

describe("convertStudyValues", () => {
    it("converts reward and rate into the target currency", () => {
        const result = convertStudyValues(study(), enabledUsd);
        expect(result.reward).toBeCloseTo(13);
        expect(result.rate).toBeCloseTo(15.6);
        expect(result.symbol).toBe("$");
    });

    it("keeps original values when conversion is disabled", () => {
        const result = convertStudyValues(study(), {
            ...enabledUsd,
            enabled: false,
        });
        expect(result).toEqual({ reward: 10, rate: 12, symbol: "£" });
    });

    it("falls back to originals when rates were never fetched", () => {
        const stale = {
            GBP: { timestamp: 0, rates: { USD: 1.3 } },
        } as unknown as ConversionRates;

        const result = convertStudyValues(study(), {
            ...enabledUsd,
            conversionRates: stale,
        });
        expect(result).toEqual({ reward: 10, rate: 12, symbol: "£" });
    });
});

describe("getMatchableOpportunity", () => {
    it("rounds converted study values to the displayed precision", () => {
        const result = getMatchableOpportunity(
            study({ reward: 7.77, symbol: "£" }),
            enabledUsd,
        );
        // 7.77 * 1.3 = 10.101 -> 10.1
        expect(result).toMatchObject({ reward: 10.1, symbol: "$" });
    });

    it("passes non-study opportunities through unchanged", () => {
        const project: ProjectInfo = {
            id: "p1",
            kind: "project",
            title: "Project",
            link: null,
            availableStudyCount: 3,
        };
        expect(getMatchableOpportunity(project, enabledUsd)).toBe(project);
    });
});
