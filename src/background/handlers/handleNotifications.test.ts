import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { storage } from "#imports";
import { SettingsStore } from "@/store/SettingsStore";
import { NOTIFY_TTL_MS } from "@/constants";
import { getOpportunityKey } from "@/lib/opportunities/opportunities";
import { createProject, createStudy } from "@/tests/utils/opportunities";
import {
    handleOpportunitiesDetected,
    type RuntimeOpportunityMetaProvider,
} from "./handleNotifications";
import { deliverNotifications } from "./notifications/delivery";

import type { ProjectInfo } from "@/adapters/BaseAdapter";
import type { RuntimeSeenMeta } from "@/messages/types";

vi.mock("./notifications/delivery", () => ({
    deliverNotifications: vi.fn(async () => true),
    handleNotificationClicked: vi.fn(),
    handleNotificationClosed: vi.fn(),
}));

const mockStorage = storage as typeof storage & { _clear(): void };
const deliverNotificationsMock = vi.mocked(deliverNotifications);

const siteName = "prolific" as const;

const study = createStudy("study-1", {
    title: "Visible first study",
    researcher: "Researcher",
    averageCompletionMinutes: 5,
});

const project = createProject("project-1", {
    title: "Project one",
    link: null,
});

function withProjectCount(availableStudyCount: number): ProjectInfo {
    return { ...project, availableStudyCount };
}

function createRuntimeOpportunityMetaProvider(
    key: string,
    meta: RuntimeSeenMeta,
): RuntimeOpportunityMetaProvider {
    return async () => ({ [key]: meta });
}

beforeEach(() => {
    mockStorage._clear();
    deliverNotificationsMock.mockReset();
    deliverNotificationsMock.mockResolvedValue(true);
});

afterEach(() => {
    vi.useRealTimers();
});

describe("handleOpportunitiesDetected", () => {
    it("delivers alerts while the page is visible by default", async () => {
        const store = new SettingsStore();
        const key = getOpportunityKey(study);

        await handleOpportunitiesDetected(store, {
            siteName,
            opportunities: [study],
            hidden: false,
        });

        expect(deliverNotificationsMock).toHaveBeenCalledTimes(1);
        expect(deliverNotificationsMock).toHaveBeenCalledWith(store, {
            siteName,
            notifications: [
                expect.objectContaining({
                    title: study.title,
                    link: study.link,
                }),
            ],
        });

        const state = await store.sites
            .entry(siteName)
            .get(["opportunityAlerts"]);
        expect(state.opportunityAlerts.cache.opportunities).toHaveProperty(key);
    });

    it("marks visible alerts handled when visible-page suppression is enabled", async () => {
        const store = new SettingsStore();
        const key = getOpportunityKey(study);

        await store.sites.entry(siteName).patch({
            opportunityAlerts: {
                suppressWhenVisible: true,
            },
        });

        await handleOpportunitiesDetected(store, {
            siteName,
            opportunities: [study],
            hidden: false,
        });

        expect(deliverNotificationsMock).not.toHaveBeenCalled();

        const visibleState = await store.sites
            .entry(siteName)
            .get(["opportunityAlerts"]);
        expect(
            visibleState.opportunityAlerts.cache.opportunities,
        ).toHaveProperty(key);

        await handleOpportunitiesDetected(store, {
            siteName,
            opportunities: [study],
            hidden: true,
        });

        expect(deliverNotificationsMock).not.toHaveBeenCalled();
    });

    it("refreshes continuously observed study baselines without re-alerting after the dedupe TTL", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(0);

        const store = new SettingsStore();

        await handleOpportunitiesDetected(store, {
            siteName,
            opportunities: [study],
            hidden: true,
        });

        expect(deliverNotificationsMock).toHaveBeenCalledTimes(1);

        vi.setSystemTime(NOTIFY_TTL_MS / 2);

        await handleOpportunitiesDetected(store, {
            siteName,
            opportunities: [study],
            hidden: true,
        });

        expect(deliverNotificationsMock).toHaveBeenCalledTimes(1);

        vi.setSystemTime(NOTIFY_TTL_MS + 1);

        await handleOpportunitiesDetected(store, {
            siteName,
            opportunities: [study],
            hidden: true,
        });

        expect(deliverNotificationsMock).toHaveBeenCalledTimes(1);
    });

    it("alerts when an absent study reappears after the opportunity TTL", async () => {
        vi.useFakeTimers();
        vi.setSystemTime(0);

        const store = new SettingsStore();

        await handleOpportunitiesDetected(store, {
            siteName,
            opportunities: [study],
            hidden: true,
        });

        expect(deliverNotificationsMock).toHaveBeenCalledTimes(1);

        vi.setSystemTime(NOTIFY_TTL_MS);

        await handleOpportunitiesDetected(store, {
            siteName,
            opportunities: [],
            hidden: true,
        });

        expect(deliverNotificationsMock).toHaveBeenCalledTimes(1);

        vi.setSystemTime(NOTIFY_TTL_MS + 1);
        await handleOpportunitiesDetected(store, {
            siteName,
            opportunities: [study],
            hidden: true,
        });

        expect(deliverNotificationsMock).toHaveBeenCalledTimes(2);
    });

    it("uses recent runtime metadata to avoid alerting known studies when the notification cache is missing", async () => {
        vi.useFakeTimers();
        const now = NOTIFY_TTL_MS * 2;
        vi.setSystemTime(now);

        const store = new SettingsStore();
        const key = getOpportunityKey(study);
        const getRuntimeOpportunityMeta = createRuntimeOpportunityMetaProvider(
            key,
            {
                firstSeenAt: now - NOTIFY_TTL_MS / 2,
                lastSeenAt: now - NOTIFY_TTL_MS / 2,
                lastChangedAt: now - NOTIFY_TTL_MS / 2,
                lastAlertableChangeAt: now - NOTIFY_TTL_MS / 2,
                fingerprint: "present",
            },
        );

        await handleOpportunitiesDetected(
            store,
            {
                siteName,
                opportunities: [study],
                hidden: true,
            },
            getRuntimeOpportunityMeta,
        );

        expect(deliverNotificationsMock).not.toHaveBeenCalled();

        const state = await store.sites
            .entry(siteName)
            .get(["opportunityAlerts"]);
        expect(state.opportunityAlerts.cache.opportunities).toHaveProperty(key);
    });

    it("allows known studies to alert again when runtime metadata is stale", async () => {
        vi.useFakeTimers();
        const now = NOTIFY_TTL_MS * 2;
        vi.setSystemTime(now);

        const store = new SettingsStore();
        const getRuntimeOpportunityMeta = createRuntimeOpportunityMetaProvider(
            getOpportunityKey(study),
            {
                firstSeenAt: now - NOTIFY_TTL_MS,
                lastSeenAt: now - NOTIFY_TTL_MS,
                lastChangedAt: now - NOTIFY_TTL_MS,
                lastAlertableChangeAt: now - NOTIFY_TTL_MS,
                fingerprint: "present",
            },
        );

        await handleOpportunitiesDetected(
            store,
            {
                siteName,
                opportunities: [study],
                hidden: true,
            },
            getRuntimeOpportunityMeta,
        );

        expect(deliverNotificationsMock).toHaveBeenCalledTimes(1);
    });

    it("uses recent runtime project metadata as the previous alert baseline", async () => {
        vi.useFakeTimers();
        const now = NOTIFY_TTL_MS * 2;
        vi.setSystemTime(now);

        const store = new SettingsStore();
        const getRuntimeOpportunityMeta = createRuntimeOpportunityMetaProvider(
            getOpportunityKey(project),
            {
                firstSeenAt: now - NOTIFY_TTL_MS / 2,
                lastSeenAt: now - NOTIFY_TTL_MS / 2,
                lastChangedAt: now - NOTIFY_TTL_MS / 2,
                lastAlertableChangeAt: now - NOTIFY_TTL_MS / 2,
                fingerprint: "0",
            },
        );

        await handleOpportunitiesDetected(
            store,
            {
                siteName,
                opportunities: [withProjectCount(1)],
                hidden: true,
            },
            getRuntimeOpportunityMeta,
        );

        expect(deliverNotificationsMock).toHaveBeenCalledTimes(1);
        expect(deliverNotificationsMock).toHaveBeenLastCalledWith(store, {
            siteName,
            notifications: [
                expect.objectContaining({
                    title: project.title,
                    message: expect.stringContaining(
                        "0 -> 1 studies available",
                    ),
                }),
            ],
        });
    });

    it("updates project baselines when availability drops to zero", async () => {
        const store = new SettingsStore();
        const key = getOpportunityKey(project);

        await handleOpportunitiesDetected(store, {
            siteName,
            opportunities: [withProjectCount(1)],
            hidden: true,
        });

        expect(deliverNotificationsMock).toHaveBeenCalledTimes(1);

        await handleOpportunitiesDetected(store, {
            siteName,
            opportunities: [withProjectCount(0)],
            hidden: true,
        });

        expect(deliverNotificationsMock).toHaveBeenCalledTimes(1);

        const zeroState = await store.sites
            .entry(siteName)
            .get(["opportunityAlerts"]);
        expect(
            zeroState.opportunityAlerts.cache.opportunities[key]
                ?.availableStudyCount,
        ).toBe(0);

        await handleOpportunitiesDetected(store, {
            siteName,
            opportunities: [withProjectCount(1)],
            hidden: true,
        });

        expect(deliverNotificationsMock).toHaveBeenCalledTimes(2);
        expect(deliverNotificationsMock).toHaveBeenLastCalledWith(store, {
            siteName,
            notifications: [
                expect.objectContaining({
                    title: project.title,
                    message: expect.stringContaining(
                        "0 -> 1 studies available",
                    ),
                }),
            ],
        });
    });
});
