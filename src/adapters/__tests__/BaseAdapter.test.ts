import { describe, expect, it } from "vitest";
import { CloudResearchAdapter } from "../CloudResearchAdapter";
import { ProlificAdapter } from "../ProlificAdapter";
import { createCapabilityElement, createQueryElement } from "./utils";

import type { NetworkRequestEvent } from "@/events/network";

class TestProlificAdapter extends ProlificAdapter {
    match(event: NetworkRequestEvent) {
        return this.matchNetworkEvent(event);
    }

    capabilityHints(el: HTMLElement) {
        return this.getCapabilityHints(el);
    }
}

class TestCloudResearchAdapter extends CloudResearchAdapter {
    match(event: NetworkRequestEvent) {
        return this.matchNetworkEvent(event);
    }

    capabilityHints(el: HTMLElement) {
        return this.getCapabilityHints(el);
    }
}

describe("BaseAdapter network matching", () => {
    it("matches Prolific completions only when the request body action matches", () => {
        const adapter = new TestProlificAdapter();

        expect(
            adapter.match({
                url: "https://internal-api.prolific.com/api/v1/submissions/123/transition",
                method: "POST",
                statusCode: 200,
                requestBody: { action: "COMPLETE" },
            }),
        ).toBe("studyCompletion");

        expect(
            adapter.match({
                url: "https://internal-api.prolific.com/api/v1/submissions/123/transition",
                method: "POST",
                statusCode: 200,
                requestBody: { action: "RETURN" },
            }),
        ).toBeNull();
    });

    it("supports request body field membership matching", () => {
        const adapter = new TestProlificAdapter();

        (adapter.config.networkPatterns as any).studyCompletion = [
            {
                path: "/transition",
                method: "POST",
                requestBody: {
                    field: "action",
                    in: ["COMPLETE", "SCREENED_OUT"],
                },
            },
        ];

        expect(
            adapter.match({
                url: "https://internal-api.prolific.com/api/v1/submissions/123/transition",
                method: "POST",
                statusCode: 200,
                requestBody: { action: "SCREENED_OUT" },
            }),
        ).toBe("studyCompletion");
    });

    it("keeps path and method matching unchanged when no request body matcher is present", () => {
        const adapter = new TestCloudResearchAdapter();

        expect(
            adapter.match({
                url: "https://connect.cloudresearch.com/participant-api/studies/123/submit",
                method: "POST",
                statusCode: 200,
            }),
        ).toBe("studyCompletion");
    });
});

describe("Site capability hint collection", () => {
    it("collects Prolific hints from device badge test ids", () => {
        const adapter = new TestProlificAdapter();
        const hints = adapter.capabilityHints(
            createQueryElement({
                "span.device-icon[data-testid]": [
                    createCapabilityElement({
                        attrs: { "data-testid": "device-desktop" },
                    }),
                    createCapabilityElement({
                        attrs: { "data-testid": "device-mobile" },
                    }),
                    createCapabilityElement({
                        attrs: { "data-testid": "peripheral-microphone" },
                    }),
                ],
            }),
        );

        expect(hints).toEqual(
            expect.arrayContaining([
                "device-desktop",
                "device-mobile",
                "peripheral-microphone",
            ]),
        );
    });

    it("collects CloudResearch supported devices and peripheral icons", () => {
        const adapter = new TestCloudResearchAdapter();
        const hints = adapter.capabilityHints(
            createQueryElement({
                '[class*="fa-"]': [
                    createCapabilityElement({
                        classes: ["fa-desktop"],
                        supported: true,
                    }),
                    createCapabilityElement({ classes: ["fa-tablet"] }),
                ],
                '[class*="fas"].cr-text-secondary': [
                    createCapabilityElement({ classes: ["fas", "fa-microphone"] }),
                    createCapabilityElement({ classes: ["fas", "fa-download"] }),
                ],
            }),
        );

        expect(hints).toEqual(
            expect.arrayContaining([
                "fa-desktop",
                "fa-microphone",
                "fa-download",
            ]),
        );
        expect(hints).not.toContain("fa-tablet");
    });
});
