import { describe, expect, it } from "vitest";
import {
    matchesAlertCondition,
    matchesAlertRules,
    type AlertRules,
} from "./alertRules";
import { defaultAlertRules } from "./defaultAlertRules";

import type { StudyInfo } from "@/adapters/BaseAdapter";

function study(overrides: Partial<StudyInfo> = {}): StudyInfo {
    return {
        id: "study-a",
        title: "Memory and attention",
        researcher: "Research Lab",
        reward: 4,
        rate: 16,
        link: null,
        symbol: "$",
        devices: [],
        peripherals: [],
        averageCompletionMinutes: 10,
        slots: 10,
        ...overrides,
    };
}

describe("alert rules", () => {
    it("notifies every study when no complete include or exclude rules exist", () => {
        expect(matchesAlertRules(study(), defaultAlertRules)).toBe(true);
    });

    it("obeys include rules in 'all' mode", () => {
        const rules: AlertRules = {
            include: {
                mode: "all",
                conditions: [
                    {
                        id: "rate",
                        field: "rate",
                        operator: "gte",
                        value: 15,
                    },
                    {
                        id: "title",
                        field: "title",
                        operator: "contains",
                        value: "memory",
                    },
                ],
            },
            exclude: {
                mode: "any",
                conditions: [],
            },
        };

        expect(
            matchesAlertRules(study({ rate: 16, title: "Memory" }), rules),
        ).toBe(true);
        expect(
            matchesAlertRules(study({ rate: 14, title: "Memory" }), rules),
        ).toBe(false);
        expect(
            matchesAlertRules(study({ rate: 16, title: "Attention" }), rules),
        ).toBe(false);
    });

    it("obeys include rules in 'any' mode", () => {
        const rules: AlertRules = {
            include: {
                mode: "any",
                conditions: [
                    {
                        id: "rate",
                        field: "rate",
                        operator: "gte",
                        value: 15,
                    },
                    {
                        id: "title",
                        field: "title",
                        operator: "contains",
                        value: "memory",
                    },
                ],
            },
            exclude: {
                mode: "any",
                conditions: [],
            },
        };

        expect(matchesAlertRules(study({ rate: 16 }), rules)).toBe(true);
        expect(matchesAlertRules(study({ title: "Memory" }), rules)).toBe(true);
        expect(
            matchesAlertRules(study({ rate: 14, title: "Attention" }), rules),
        ).toBe(false);
    });

    it("matches numeric threshold conditions", () => {
        const rules: AlertRules = {
            include: {
                mode: "all",
                conditions: [
                    {
                        id: "rate",
                        field: "rate",
                        operator: "gte",
                        value: 15,
                    },
                ],
            },
            exclude: {
                mode: "any",
                conditions: [],
            },
        };

        expect(matchesAlertRules(study({ rate: 16 }), rules)).toBe(true);
        expect(matchesAlertRules(study({ rate: 14 }), rules)).toBe(false);
    });

    it("lets exclude rules override include rules", () => {
        const rules: AlertRules = {
            include: {
                mode: "all",
                conditions: [
                    {
                        id: "rate",
                        field: "rate",
                        operator: "gte",
                        value: 15,
                    },
                ],
            },
            exclude: {
                mode: "any",
                conditions: [
                    {
                        id: "title",
                        field: "title",
                        operator: "contains",
                        value: "memory",
                    },
                ],
            },
        };

        expect(matchesAlertRules(study(), rules)).toBe(false);
    });

    it("ignores incomplete conditions", () => {
        const rules: AlertRules = {
            include: {
                mode: "all",
                conditions: [
                    {
                        id: "blank",
                        field: "title",
                        operator: "contains",
                        value: "",
                    },
                ],
            },
            exclude: {
                mode: "any",
                conditions: [],
            },
        };

        expect(matchesAlertRules(study(), rules)).toBe(true);
    });

    it("matches text values case-insensitively", () => {
        expect(
            matchesAlertCondition(study(), {
                id: "researcher",
                field: "researcher",
                operator: "contains",
                value: "research lab",
            }),
        ).toBe(true);
    });
});
