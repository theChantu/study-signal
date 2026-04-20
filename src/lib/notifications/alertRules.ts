import type { StudyInfo } from "@/adapters/BaseAdapter";

export const alertRuleFields = [
    "title",
    "researcher",
    "reward",
    "rate",
    "slots",
    "averageCompletionMinutes",
] as const;

export type AlertRuleField = (typeof alertRuleFields)[number];

export type AlertRuleFieldType = "text" | "number";

export const alertRuleFieldLabels = {
    title: "Study title",
    researcher: "Researcher",
    reward: "Reward",
    rate: "Hourly rate",
    slots: "Slots",
    averageCompletionMinutes: "Avg completion (mins)",
} as const satisfies Record<AlertRuleField, string>;

const alertRuleFieldTypes = {
    title: "text",
    researcher: "text",
    reward: "number",
    rate: "number",
    slots: "number",
    averageCompletionMinutes: "number",
} as const satisfies Record<AlertRuleField, AlertRuleFieldType>;

export const alertRuleFieldPlaceholders = {
    title: "e.g. Study",
    researcher: "e.g. University of Oxford",
    reward: "e.g. 2.50",
    rate: "e.g. 12.00",
    slots: "e.g. 10",
    averageCompletionMinutes: "e.g. 5",
} as const satisfies Record<AlertRuleField, string>;

export const textAlertRuleOperators = [
    "contains",
    "not_contains",
    "equals",
    "not_equals",
] as const;

export const numberAlertRuleOperators = [
    "gt",
    "gte",
    "lt",
    "lte",
    "equals",
    "not_equals",
] as const;

export type TextAlertRuleOperator = (typeof textAlertRuleOperators)[number];
export type NumberAlertRuleOperator = (typeof numberAlertRuleOperators)[number];
export type AlertRuleOperator = TextAlertRuleOperator | NumberAlertRuleOperator;

export const alertRuleOperatorLabels = {
    contains: "contains",
    not_contains: "excludes",
    equals: "=",
    not_equals: "≠",
    gt: ">",
    gte: "≥",
    lt: "<",
    lte: "≤",
} as const satisfies Record<AlertRuleOperator, string>;

export type AlertRuleGroupMode = "all" | "any";

export type AlertCondition = {
    id: string;
    field: AlertRuleField;
    operator: AlertRuleOperator;
    value?: string | number;
};

export type AlertRuleGroup = {
    mode: AlertRuleGroupMode;
    conditions: AlertCondition[];
};

export type AlertRules = {
    include: AlertRuleGroup;
    exclude: AlertRuleGroup;
};

function isAlertRuleField(field: string): field is AlertRuleField {
    return (alertRuleFields as readonly string[]).includes(field);
}

export function getAlertRuleFieldType(
    field: AlertRuleField,
): AlertRuleFieldType {
    return alertRuleFieldTypes[field];
}

export function getAlertRuleOperators(
    field: AlertRuleField,
): readonly AlertRuleOperator[] {
    return getAlertRuleFieldType(field) === "number"
        ? numberAlertRuleOperators
        : textAlertRuleOperators;
}

export function getDefaultAlertRuleOperator(
    field: AlertRuleField,
): AlertRuleOperator {
    return getAlertRuleOperators(field)[0];
}

function normalizeText(value: string): string {
    return value.trim().toLowerCase();
}

function coerceText(value: unknown): string | null {
    if (typeof value !== "string") return null;

    const normalized = normalizeText(value);
    return normalized.length > 0 ? normalized : null;
}

function coerceNumber(value: unknown): number | null {
    const number =
        typeof value === "number"
            ? value
            : typeof value === "string" && value.trim().length > 0
              ? Number(value)
              : NaN;

    return Number.isFinite(number) ? number : null;
}

function isCompatibleOperator(
    field: AlertRuleField,
    operator: AlertRuleOperator,
): boolean {
    return getAlertRuleOperators(field).includes(operator);
}

export function isAlertConditionComplete(condition: AlertCondition): boolean {
    if (!isAlertRuleField(condition.field)) return false;
    if (!isCompatibleOperator(condition.field, condition.operator))
        return false;

    return getAlertRuleFieldType(condition.field) === "number"
        ? coerceNumber(condition.value) !== null
        : coerceText(condition.value) !== null;
}

function matchesTextCondition(
    actualValue: string | null,
    condition: AlertCondition,
): boolean {
    const expectedValue = coerceText(condition.value);

    switch (condition.operator) {
        case "contains":
            return (
                actualValue !== null &&
                expectedValue !== null &&
                actualValue.includes(expectedValue)
            );
        case "not_contains":
            return (
                actualValue !== null &&
                expectedValue !== null &&
                !actualValue.includes(expectedValue)
            );
        case "equals":
            return actualValue !== null && actualValue === expectedValue;
        case "not_equals":
            return actualValue !== null && actualValue !== expectedValue;
        default:
            return false;
    }
}

function matchesNumberCondition(
    actualValue: number | null,
    condition: AlertCondition,
): boolean {
    const expectedValue = coerceNumber(condition.value);

    switch (condition.operator) {
        case "gt":
            return (
                actualValue !== null &&
                expectedValue !== null &&
                actualValue > expectedValue
            );
        case "gte":
            return (
                actualValue !== null &&
                expectedValue !== null &&
                actualValue >= expectedValue
            );
        case "lt":
            return (
                actualValue !== null &&
                expectedValue !== null &&
                actualValue < expectedValue
            );
        case "lte":
            return (
                actualValue !== null &&
                expectedValue !== null &&
                actualValue <= expectedValue
            );
        case "equals":
            return actualValue !== null && actualValue === expectedValue;
        case "not_equals":
            return actualValue !== null && actualValue !== expectedValue;
        default:
            return false;
    }
}

export function matchesAlertCondition(
    study: StudyInfo,
    condition: AlertCondition,
): boolean {
    if (!isAlertConditionComplete(condition)) return false;

    const value = study[condition.field];

    if (getAlertRuleFieldType(condition.field) === "number") {
        return matchesNumberCondition(coerceNumber(value), condition);
    }

    return matchesTextCondition(
        typeof value === "string" ? coerceText(value) : null,
        condition,
    );
}

export function getCompleteAlertConditions(
    group: AlertRuleGroup,
): AlertCondition[] {
    return group.conditions.filter(isAlertConditionComplete);
}

export function matchesAlertRuleGroup(
    study: StudyInfo,
    group: AlertRuleGroup,
): boolean {
    const conditions = getCompleteAlertConditions(group);
    if (conditions.length === 0) return false;

    return group.mode === "all"
        ? conditions.every((condition) =>
              matchesAlertCondition(study, condition),
          )
        : conditions.some((condition) =>
              matchesAlertCondition(study, condition),
          );
}

export function matchesAlertRules(
    study: StudyInfo,
    rules: AlertRules,
): boolean {
    if (matchesAlertRuleGroup(study, rules.exclude)) return false;

    const includeConditions = getCompleteAlertConditions(rules.include);
    if (includeConditions.length === 0) return true;

    return matchesAlertRuleGroup(study, rules.include);
}
