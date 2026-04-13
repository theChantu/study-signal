import { describe, expect, it } from "vitest";

import { parseDurationSeconds } from "../parse/parseDurationSeconds";

describe("parseDurationSeconds", () => {
    it("parses minutes", () => {
        expect(parseDurationSeconds("10 minutes")).toBe(600);
    });

    it("parses mixed hours and minutes", () => {
        expect(parseDurationSeconds("1 hour and 20 mins")).toBe(4800);
    });

    it("parses seconds", () => {
        expect(parseDurationSeconds("45 sec")).toBe(45);
    });

    it("parses mixed units with compact abbreviations", () => {
        expect(parseDurationSeconds("1 hr 2 min 30 s")).toBe(3750);
    });

    it("normalizes extra whitespace", () => {
        expect(parseDurationSeconds("\n 10 \n minutes \t")).toBe(600);
    });

    it("returns null when no duration tokens are present", () => {
        expect(parseDurationSeconds("available now")).toBeNull();
        expect(parseDurationSeconds(null)).toBeNull();
    });
});
