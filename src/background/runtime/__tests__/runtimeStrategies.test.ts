import { describe, expect, it } from "vitest";

import {
    clearRuntimeMeta,
    enrichRuntimeData,
    hasRuntimeStrategy,
    updateRuntimeMeta,
} from "../runtimeStrategies";
import { createStudy } from "./utils";

describe("runtimeStrategies", () => {
    it("reports which channels have runtime strategies", () => {
        expect(hasRuntimeStrategy("studies")).toBe(true);
    });

    it("creates and updates seen metadata without resetting firstSeenAt", () => {
        const runtimeMeta = {};

        const initial = updateRuntimeMeta(
            runtimeMeta,
            "studies",
            "prolific",
            [
                createStudy("study-a", {
                    title: "Study A",
                    researcher: "Researcher A",
                }),
            ],
            100,
        );

        expect(initial).toEqual({
            "study-a": {
                firstSeenAt: 100,
                lastSeenAt: 100,
            },
        });

        const updated = updateRuntimeMeta(
            runtimeMeta,
            "studies",
            "prolific",
            [
                createStudy("study-a", {
                    title: "Study A",
                    researcher: "Researcher A",
                    link: "https://app.prolific.com/studies/a",
                }),
                createStudy("study-b", {
                    title: "Study B",
                    researcher: "Researcher B",
                    reward: 2,
                    rate: 14,
                    link: "https://app.prolific.com/studies/b",
                }),
            ],
            250,
        );

        expect(updated).toEqual({
            "study-a": {
                firstSeenAt: 100,
                lastSeenAt: 250,
            },
            "study-b": {
                firstSeenAt: 250,
                lastSeenAt: 250,
            },
        });
    });

    it("enriches studies with seen metadata for a site", () => {
        const runtimeMeta = {};

        updateRuntimeMeta(
            runtimeMeta,
            "studies",
            "prolific",
            [
                createStudy("study-a", {
                    title: "Study A",
                    researcher: "Researcher A",
                }),
            ],
            100,
        );

        const enriched = enrichRuntimeData(runtimeMeta, "studies", "prolific", [
            createStudy("study-a", {
                title: "Study A",
                researcher: "Researcher A",
            }),
        ]);

        expect(enriched).toEqual([
            {
                ...createStudy("study-a", {
                    title: "Study A",
                    researcher: "Researcher A",
                }),
                firstSeenAt: 100,
                lastSeenAt: 100,
            },
        ]);
    });

    it("reuses persisted firstSeenAt when runtime meta is reloaded after a restart", () => {
        const persistedRuntimeMeta = {
            studies: {
                prolific: {
                    "study-a": {
                        firstSeenAt: 100,
                        lastSeenAt: 100,
                    },
                },
            },
        };

        const enriched = enrichRuntimeData(
            persistedRuntimeMeta,
            "studies",
            "prolific",
            [
                createStudy("study-a", {
                    title: "Study A",
                    researcher: "Researcher A",
                }),
            ],
        );

        expect(enriched[0]).toMatchObject({
            id: "study-a",
            firstSeenAt: 100,
            lastSeenAt: 100,
        });
    });

    it("clears per-site metadata and removes the channel bucket when empty", () => {
        const runtimeMeta = {};

        updateRuntimeMeta(
            runtimeMeta,
            "studies",
            "prolific",
            [
                createStudy("study-a", {
                    title: "Study A",
                    researcher: "Researcher A",
                }),
            ],
            100,
        );
        updateRuntimeMeta(
            runtimeMeta,
            "studies",
            "cloudresearch",
            [
                createStudy("study-b", {
                    title: "Study B",
                    researcher: "Researcher B",
                    reward: 2,
                    rate: 14,
                    link: "https://connect.cloudresearch.com/participant/dashboard/b",
                }),
            ],
            200,
        );

        clearRuntimeMeta(runtimeMeta, "studies", "prolific");
        expect(runtimeMeta).toEqual({
            studies: {
                cloudresearch: {
                    "study-b": {
                        firstSeenAt: 200,
                        lastSeenAt: 200,
                    },
                },
            },
        });

        clearRuntimeMeta(runtimeMeta, "studies", "cloudresearch");
        expect(runtimeMeta).toEqual({});
    });
});
