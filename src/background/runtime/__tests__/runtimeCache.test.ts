import { describe, expect, it } from "vitest";

import {
    clearRuntimeTab,
    createRuntimeCache,
    getListingsSiteName,
    readRuntimeCache,
    updateRuntimeCache,
} from "../runtimeCache";

import { createStudy } from "./utils";

describe("runtimeCache", () => {
    it("does not report a change when the same tab syncs identical studies", () => {
        const cache = createRuntimeCache();
        const studies = [createStudy("a")];

        updateRuntimeCache(cache, "studies", "prolific", 1, studies);
        const result = updateRuntimeCache(
            cache,
            "studies",
            "prolific",
            1,
            studies,
        );

        expect(result.changed).toBe(false);
        expect(result.data?.map((study) => study.id)).toEqual(["a"]);
    });

    it("aggregates studies across tabs for the same site", () => {
        const cache = createRuntimeCache();

        updateRuntimeCache(cache, "studies", "prolific", 1, [createStudy("a")]);

        const result = updateRuntimeCache(cache, "studies", "prolific", 2, [
            createStudy("b", {
                reward: 2,
                rate: 14,
            }),
        ]);

        expect(result.changed).toBe(true);
        expect(result.data?.map((study) => study.id)).toEqual(["a", "b"]);
    });

    it("deduplicates studies by id when multiple tabs report the same study", () => {
        const cache = createRuntimeCache();

        updateRuntimeCache(cache, "studies", "prolific", 1, [
            createStudy("shared", {
                title: "Study A",
                researcher: "Researcher A",
                link: "https://app.prolific.com/studies/a",
            }),
        ]);

        const result = updateRuntimeCache(cache, "studies", "prolific", 2, [
            createStudy("shared", {
                title: "Study A (updated)",
                researcher: "Researcher A",
                reward: 2,
                rate: 13,
                link: "https://app.prolific.com/studies/a",
            }),
        ]);

        expect(result.data).toHaveLength(1);
        expect(result.data?.[0]?.title).toBe("Study A (updated)");
    });

    it("clears runtime data when a tab is removed", () => {
        const cache = createRuntimeCache();

        updateRuntimeCache(cache, "studies", "prolific", 1, [createStudy("a")]);

        const changes = clearRuntimeTab(cache, 1);

        expect(changes).toEqual([
            {
                channel: "studies",
                siteName: "prolific",
                data: null,
            },
        ]);
        expect(readRuntimeCache(cache, "studies", "prolific")).toBeNull();
    });

    it("returns the remaining aggregated studies when one of multiple tabs is removed", () => {
        const cache = createRuntimeCache();

        updateRuntimeCache(cache, "studies", "prolific", 1, [createStudy("a")]);
        updateRuntimeCache(cache, "studies", "prolific", 2, [
            createStudy("b", {
                reward: 2,
                rate: 14,
            }),
        ]);

        const changes = clearRuntimeTab(cache, 1);

        expect(changes).toEqual([
            {
                channel: "studies",
                siteName: "prolific",
                data: [
                    createStudy("b", {
                        reward: 2,
                        rate: 14,
                    }),
                ],
            },
        ]);
        expect(
            readRuntimeCache(cache, "studies", "prolific")?.map(
                (study) => study.id,
            ),
        ).toEqual(["b"]);
    });

    it("keeps current listing data during same-site listing navigation", () => {
        const cache = createRuntimeCache();

        updateRuntimeCache(cache, "studies", "prolific", 1, [createStudy("a")]);

        const changes = clearRuntimeTab(
            cache,
            1,
            getListingsSiteName("https://app.prolific.com/studies?page=2"),
        );

        expect(changes).toEqual([]);
        expect(readRuntimeCache(cache, "studies", "prolific")).not.toBeNull();
    });

    it("detects non-listings pages as not retaining runtime data", () => {
        expect(
            getListingsSiteName("https://app.prolific.com/account"),
        ).toBeNull();
    });
});
