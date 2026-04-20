import type { AlertRules } from "./alertRules";

export const defaultAlertRules: AlertRules = Object.freeze({
    include: {
        mode: "all",
        conditions: [],
    },
    exclude: {
        mode: "any",
        conditions: [],
    },
});
