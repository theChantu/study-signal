import { describe, expect, it } from "vitest";
import { CloudResearchAdapter } from "./CloudResearchAdapter";
import { ProlificAdapter } from "./ProlificAdapter";

import type { NetworkRequestEvent } from "@/events/network";

class TestProlificAdapter extends ProlificAdapter {
    match(event: NetworkRequestEvent) {
        return this.matchNetworkEvent(event);
    }
}

class TestCloudResearchAdapter extends CloudResearchAdapter {
    match(event: NetworkRequestEvent) {
        return this.matchNetworkEvent(event);
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
