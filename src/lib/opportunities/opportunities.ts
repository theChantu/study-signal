import { NOTIFY_TTL_MS } from "@/constants";

import type { OpportunityInfo } from "@/adapters/BaseAdapter";

export type OpportunityBaseline = {
    availableStudyCount: number | null;
};

export function getOpportunityKey(opportunity: OpportunityInfo): string {
    return `${opportunity.kind}:${opportunity.id}`;
}

export function getOpportunityFingerprint(
    opportunity: OpportunityInfo,
): string {
    switch (opportunity.kind) {
        case "project":
            return String(opportunity.availableStudyCount ?? "");
        case "study":
            return "present";
    }
}

export function isOpportunityAlertable(
    opportunity: OpportunityInfo,
    previous?: OpportunityInfo,
): boolean {
    switch (opportunity.kind) {
        case "study":
            return previous === undefined;

        case "project": {
            const currentCount = opportunity.availableStudyCount;
            if (currentCount === null || currentCount <= 0) return false;

            if (!previous || previous.kind !== "project") return true;

            const previousCount = previous.availableStudyCount;
            return previousCount === null || currentCount > previousCount;
        }
    }
}

export function isOpportunityCurrentlyAvailable(
    opportunity: OpportunityInfo,
): boolean {
    switch (opportunity.kind) {
        case "study":
            return true;

        case "project":
            return (
                opportunity.availableStudyCount !== null &&
                opportunity.availableStudyCount > 0
            );
    }
}

export function shouldRefreshOpportunityBaseline(
    opportunity: OpportunityInfo,
    previous: OpportunityBaseline | undefined,
    alertable: boolean,
): boolean {
    if (alertable || previous !== undefined) return true;

    switch (opportunity.kind) {
        case "study":
            return false;

        case "project":
            return true;
    }
}

export function isStaleAlertableOpportunityReappearance(
    opportunity: OpportunityInfo,
    lastSeenAt: number,
    now: number,
    staleThresholdMs = NOTIFY_TTL_MS,
): boolean {
    return (
        now - lastSeenAt >= staleThresholdMs &&
        isOpportunityAlertable(opportunity)
    );
}
