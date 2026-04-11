import { describe, expect, it } from "vitest";
import { parseJsonRequestBody } from "./requestBody";

function encodeJson(value: unknown) {
    return new TextEncoder().encode(JSON.stringify(value)).buffer;
}

describe("parseJsonRequestBody", () => {
    it("parses a JSON request body from raw bytes", () => {
        const body = parseJsonRequestBody({
            raw: [{ bytes: encodeJson({ action: "COMPLETE" }) }],
        });

        expect(body).toEqual({ action: "COMPLETE" });
    });

    it("returns undefined for invalid JSON bodies", () => {
        const body = parseJsonRequestBody({
            raw: [{ bytes: new TextEncoder().encode("not-json").buffer }],
        });

        expect(body).toBeUndefined();
    });

    it("combines multiple raw chunks before parsing", () => {
        const body = parseJsonRequestBody({
            raw: [
                { bytes: new TextEncoder().encode('{"action":"COM').buffer },
                { bytes: new TextEncoder().encode('PLETE"}').buffer },
            ],
        });

        expect(body).toEqual({ action: "COMPLETE" });
    });
});
