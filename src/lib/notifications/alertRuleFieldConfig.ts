import type { OpportunityInfo, OpportunityKind } from "@/adapters/BaseAdapter";
import type { AlertRuleFieldType } from "./alertRules";

type AlertRuleValue = string | number | null;
type AlertRuleApplicability = "all" | readonly OpportunityKind[];

type AlertRuleFieldConfig = {
    label: string;
    type: AlertRuleFieldType;
    placeholder: string;
    appliesTo: AlertRuleApplicability;
    getValue: (opportunity: OpportunityInfo) => AlertRuleValue;
};

export const alertRuleFieldConfig = {
    kind: {
        label: "Opportunity",
        type: "text",
        placeholder: "e.g. study",
        appliesTo: "all",
        getValue: (opportunity) => opportunity.kind,
    },
    title: {
        label: "Title",
        type: "text",
        placeholder: "e.g. Study",
        appliesTo: "all",
        getValue: (opportunity) => opportunity.title,
    },
    researcher: {
        label: "Researcher",
        type: "text",
        placeholder: "e.g. University of Oxford",
        appliesTo: ["study"],
        getValue: (opportunity) =>
            opportunity.kind === "study" ? opportunity.researcher : null,
    },
    reward: {
        label: "Reward",
        type: "number",
        placeholder: "e.g. 2.50",
        appliesTo: ["study"],
        getValue: (opportunity) =>
            opportunity.kind === "study" ? opportunity.reward : null,
    },
    rate: {
        label: "Hourly rate",
        type: "number",
        placeholder: "e.g. 12.00",
        appliesTo: ["study"],
        getValue: (opportunity) =>
            opportunity.kind === "study" ? opportunity.rate : null,
    },
    slots: {
        label: "Slots",
        type: "number",
        placeholder: "e.g. 10",
        appliesTo: ["study"],
        getValue: (opportunity) =>
            opportunity.kind === "study" ? opportunity.slots : null,
    },
    averageCompletionMinutes: {
        label: "Avg completion (mins)",
        type: "number",
        placeholder: "e.g. 5",
        appliesTo: ["study"],
        getValue: (opportunity) =>
            opportunity.kind === "study"
                ? opportunity.averageCompletionMinutes
                : null,
    },
} as const satisfies Record<string, AlertRuleFieldConfig>;
