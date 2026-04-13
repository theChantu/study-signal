import { describe, expect, it } from "vitest";

import {
    DEVICE_PATTERNS,
    PERIPHERAL_PATTERNS,
    matchCapabilities,
} from "../capabilities";

describe("matchCapabilities", () => {
    it("normalizes desktop and laptop hints into the desktop device", () => {
        const devices = matchCapabilities(
            ["Desktop", "laptop", "lucide-monitor"],
            DEVICE_PATTERNS,
        );

        expect(devices).toEqual(["desktop"]);
    });

    it("keeps tablets and phones distinct", () => {
        const devices = matchCapabilities(["fa-tablet", "mobile"], DEVICE_PATTERNS);

        expect(devices).toEqual(["tablet", "phone"]);
    });

    it("matches multiple peripherals from mixed hints", () => {
        const peripherals = matchCapabilities(
            ["microphone", "webcam", "writing sample", "download file"],
            PERIPHERAL_PATTERNS,
        );

        expect(peripherals).toEqual([
            "microphone",
            "camera",
            "writing",
            "download",
        ]);
    });

    it("extracts audio as a separate peripheral", () => {
        const peripherals = matchCapabilities(
            ["audio recording"],
            PERIPHERAL_PATTERNS,
        );

        expect(peripherals).toEqual(["audio"]);
    });
});
