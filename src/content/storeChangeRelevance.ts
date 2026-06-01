import type { SiteName } from "@/adapters/siteConfigs";
import type { StoreChangedMessage } from "@/messages/types";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOpportunityAlertsCacheOnlyChange(value: unknown): boolean {
    if (!isRecord(value)) return false;

    const keys = Object.keys(value);
    return keys.length > 0 && keys.every((key) => key === "cache");
}

export function shouldScheduleEnhancementRunForStoreChange(
    payload: StoreChangedMessage,
    siteName: SiteName,
): boolean {
    if (payload.namespace === "globals") {
        return Object.keys(payload.data).some(
            (key) => key !== "lastPopupOpenedAt",
        );
    }

    if (payload.entry !== siteName) return false;

    return Object.entries(payload.data).some(([key, value]) => {
        if (key !== "opportunityAlerts") return true;
        return !isOpportunityAlertsCacheOnlyChange(value);
    });
}
