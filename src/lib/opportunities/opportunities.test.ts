import { describe, expect, it } from "vitest";
import { createProject, createStudy } from "@/tests/utils/opportunities";
import {
    isOpportunityAlertable,
    isOpportunityCurrentlyAvailable,
    isStaleAlertableOpportunityReappearance,
    shouldRefreshOpportunityBaseline,
} from "./opportunities";

describe("isOpportunityAlertable", () => {
    it("alerts for studies only when first seen", () => {
        expect(isOpportunityAlertable(createStudy())).toBe(true);
        expect(isOpportunityAlertable(createStudy(), createStudy())).toBe(
            false,
        );
    });

    it("does not alert for zero-count projects", () => {
        expect(
            isOpportunityAlertable(
                createProject("project-a", { availableStudyCount: 0 }),
            ),
        ).toBe(false);
    });

    it("alerts when a project has availability and no previous project baseline", () => {
        expect(
            isOpportunityAlertable(
                createProject("project-a", { availableStudyCount: 1 }),
            ),
        ).toBe(true);
    });

    it("alerts when a project count increases from the previous baseline", () => {
        expect(
            isOpportunityAlertable(
                createProject("project-a", { availableStudyCount: 2 }),
                createProject("project-a", { availableStudyCount: 1 }),
            ),
        ).toBe(true);
    });

    it("does not alert when a project count is unchanged or lower", () => {
        expect(
            isOpportunityAlertable(
                createProject("project-a", { availableStudyCount: 1 }),
                createProject("project-a", { availableStudyCount: 1 }),
            ),
        ).toBe(false);
        expect(
            isOpportunityAlertable(
                createProject("project-a", { availableStudyCount: 1 }),
                createProject("project-a", { availableStudyCount: 2 }),
            ),
        ).toBe(false);
    });
});

describe("isOpportunityCurrentlyAvailable", () => {
    it("treats studies and positive-count projects as available", () => {
        expect(isOpportunityCurrentlyAvailable(createStudy())).toBe(true);
        expect(
            isOpportunityCurrentlyAvailable(
                createProject("project-a", { availableStudyCount: 1 }),
            ),
        ).toBe(true);
    });

    it("does not treat zero or unknown project counts as available", () => {
        expect(
            isOpportunityCurrentlyAvailable(
                createProject("project-a", { availableStudyCount: 0 }),
            ),
        ).toBe(false);
        expect(
            isOpportunityCurrentlyAvailable(
                createProject("project-a", { availableStudyCount: null }),
            ),
        ).toBe(false);
    });
});

describe("shouldRefreshOpportunityBaseline", () => {
    it("refreshes alertable opportunities and previously tracked opportunities", () => {
        expect(shouldRefreshOpportunityBaseline(createStudy(), undefined, true)).toBe(
            true,
        );
        expect(
            shouldRefreshOpportunityBaseline(
                createStudy(),
                { availableStudyCount: null },
                false,
            ),
        ).toBe(true);
    });

    it("tracks projects as baselines even when they are not alertable", () => {
        expect(
            shouldRefreshOpportunityBaseline(
                createProject("project-a", { availableStudyCount: 0 }),
                undefined,
                false,
            ),
        ).toBe(true);
    });

    it("does not track brand new non-alertable studies", () => {
        expect(shouldRefreshOpportunityBaseline(createStudy(), undefined, false)).toBe(
            false,
        );
    });
});

describe("isStaleAlertableOpportunityReappearance", () => {
    it("treats stale studies as alertable reappearances", () => {
        expect(
            isStaleAlertableOpportunityReappearance(createStudy(), 100, 200, 100),
        ).toBe(true);
    });

    it("does not treat fresh opportunities or unavailable projects as stale alertable reappearances", () => {
        expect(
            isStaleAlertableOpportunityReappearance(createStudy(), 101, 200, 100),
        ).toBe(false);
        expect(
            isStaleAlertableOpportunityReappearance(
                createProject("project-a", { availableStudyCount: 0 }),
                100,
                200,
                100,
            ),
        ).toBe(false);
    });
});
