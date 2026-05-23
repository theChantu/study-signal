import { SettingsStore } from "@/store/SettingsStore";
import { NOTIFY_TTL_MS, NAME_CACHE_TTL_MS } from "@/constants";
import {
    matchesAlertRules,
    type AlertRules,
} from "@/lib/notifications/alertRules";
import log from "@/lib/log";
import {
    getOpportunityFingerprint,
    getOpportunityKey,
    isOpportunityAlertable,
    shouldRefreshOpportunityBaseline,
} from "@/lib/opportunities/opportunities";
import {
    buildNotification,
    type OpportunityCacheEntry,
} from "./notifications/buildOpportunityNotification";
import { deliverNotifications } from "./notifications/delivery";
export {
    deliverNotifications,
    handleNotificationClicked,
    handleNotificationClosed,
} from "./notifications/delivery";

import type { OpportunityInfo, StudyInfo } from "@/adapters/BaseAdapter";
import type { MessageMap } from "@/messages/types";
import type { SiteSettings } from "@/store/types";
import type { NotificationData } from "./notifications/types";
export type { NotificationData } from "./notifications/types";

function pruneOpportunityCache(
    cache: SiteSettings["opportunityAlerts"]["cache"],
    now = Date.now(),
) {
    let pruned = false;

    const opportunities = { ...cache.opportunities };
    for (const [key, entry] of Object.entries(opportunities)) {
        if (now - entry.notifiedAt >= NOTIFY_TTL_MS) {
            delete opportunities[key];
            pruned = true;
        }
    }

    const researchers = { ...cache.researchers };
    for (const [name, timestamp] of Object.entries(researchers)) {
        if (now - timestamp >= NAME_CACHE_TTL_MS) {
            delete researchers[name];
            pruned = true;
        }
    }

    const titles = { ...cache.titles };
    for (const [title, timestamp] of Object.entries(titles)) {
        if (now - timestamp >= NAME_CACHE_TTL_MS) {
            delete titles[title];
            pruned = true;
        }
    }

    return { cache: { opportunities, researchers, titles }, pruned };
}

function getCachedOpportunity(
    opportunity: OpportunityInfo,
    cache: SiteSettings["opportunityAlerts"]["cache"],
): OpportunityInfo | undefined {
    const cached = cache.opportunities[getOpportunityKey(opportunity)];
    if (!cached) return undefined;

    return opportunity.kind === "project"
        ? {
              ...opportunity,
              availableStudyCount: cached.availableStudyCount,
          }
        : opportunity;
}

function buildOpportunityCacheEntry(
    opportunity: OpportunityInfo,
    timestamp: number,
): OpportunityCacheEntry {
    return {
        notifiedAt: timestamp,
        fingerprint: getOpportunityFingerprint(opportunity),
        availableStudyCount:
            opportunity.kind === "project"
                ? opportunity.availableStudyCount
                : null,
    };
}

export async function handleOpportunitiesDetected(
    store: SettingsStore,
    payload: MessageMap["opportunities-detected"],
): Promise<void> {
    const { siteName, opportunities, hidden } = payload;

    const siteStore = store.sites.entry(siteName);
    const now = Date.now();

    const previousCacheEntries = new Map<string, OpportunityCacheEntry>();
    let alertableOpportunities: OpportunityInfo[] = [];
    let cacheableOpportunityCount = 0;
    let cachePruned = false;
    let suppressVisibleAlerts = false;
    let rules!: AlertRules;

    await siteStore.update((current) => {
        suppressVisibleAlerts =
            !hidden && current.opportunityAlerts.suppressWhenVisible;
        rules = current.opportunityAlerts.rules;
        const { cache: nextOpportunityCache, pruned } = pruneOpportunityCache(
            current.opportunityAlerts.cache,
            now,
        );
        cachePruned = pruned;

        const cacheableOpportunities: OpportunityInfo[] = [];
        alertableOpportunities = [];

        for (const opportunity of opportunities) {
            const key = getOpportunityKey(opportunity);
            const previousEntry = nextOpportunityCache.opportunities[key];
            if (previousEntry) previousCacheEntries.set(key, previousEntry);

            const alertable = isOpportunityAlertable(
                opportunity,
                getCachedOpportunity(opportunity, nextOpportunityCache),
            );

            if (alertable) {
                alertableOpportunities.push(opportunity);
            }

            if (
                shouldRefreshOpportunityBaseline(
                    opportunity,
                    previousEntry,
                    alertable,
                )
            ) {
                cacheableOpportunities.push(opportunity);
            }
        }
        cacheableOpportunityCount = cacheableOpportunities.length;

        if (cacheableOpportunities.length === 0 && !cachePruned) return {};

        for (const opportunity of cacheableOpportunities) {
            nextOpportunityCache.opportunities[getOpportunityKey(opportunity)] =
                buildOpportunityCacheEntry(opportunity, now);
        }

        for (const study of alertableOpportunities.filter(
            (opportunity): opportunity is StudyInfo =>
                opportunity.kind === "study",
        )) {
            if (!study.researcher) continue;
            const name = study.researcher.trim();
            if (!(name in nextOpportunityCache.researchers))
                nextOpportunityCache.researchers[name] = now;
        }

        for (const opportunity of alertableOpportunities) {
            if (!opportunity.title) continue;
            const title = opportunity.title.trim();
            if (title && !(title in nextOpportunityCache.titles))
                nextOpportunityCache.titles[title] = now;
        }

        return {
            opportunityAlerts: {
                cache: nextOpportunityCache,
            },
        };
    });

    log("Notification check", {
        siteName,
        hidden,
        received: opportunities.length,
        alertable: alertableOpportunities.length,
        cacheable: cacheableOpportunityCount,
        cachePruned,
        suppressVisibleAlerts,
    });

    if (alertableOpportunities.length > 0) {
        log(
            "Alertable opportunities",
            alertableOpportunities.map((opportunity) => {
                const key = getOpportunityKey(opportunity);
                const previous = previousCacheEntries.get(key);

                return {
                    key,
                    kind: opportunity.kind,
                    title: opportunity.title,
                    fingerprint: getOpportunityFingerprint(opportunity),
                    previousNotifiedAt: previous?.notifiedAt,
                    previousFingerprint: previous?.fingerprint,
                    previousAvailableStudyCount: previous?.availableStudyCount,
                };
            }),
        );
    }

    if (alertableOpportunities.length === 0) return;
    if (suppressVisibleAlerts) return;

    const notifications: NotificationData[] = [];
    for (const opportunity of alertableOpportunities) {
        if (!matchesAlertRules(opportunity, rules)) {
            log("Opportunity alert skipped by rules", {
                siteName,
                key: getOpportunityKey(opportunity),
                kind: opportunity.kind,
                title: opportunity.title,
            });
            continue;
        }

        notifications.push(
            buildNotification(
                opportunity,
                siteName,
                previousCacheEntries.get(getOpportunityKey(opportunity)),
            ),
        );
    }

    if (notifications.length === 0) return;

    log("Delivering opportunity notifications", {
        siteName,
        count: notifications.length,
        titles: notifications.map((notification) => notification.title),
    });

    await deliverNotifications(store, {
        siteName,
        notifications,
    });
}
