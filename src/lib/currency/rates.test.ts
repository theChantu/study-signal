import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultGlobalSettings } from "@/store/defaultGlobalSettings";
import { currencyKeys, type Currency } from "@/store/types";
import { sendExtensionMessage } from "@/messages/sendExtensionMessage";
import { ensureConversionRates } from "./rates";

vi.mock("@/messages/sendExtensionMessage", () => ({
    sendExtensionMessage: vi.fn(),
}));

function createRatesResponse(
    baseCode: Currency,
    overrides: Partial<Record<Currency, number>> = {},
) {
    return {
        result: "success" as const,
        time_last_update_unix: 0,
        time_last_update_utc: "",
        time_next_update_unix: 0,
        time_next_update_utc: "",
        time_eol_unix: 0,
        base_code: baseCode,
        rates: Object.fromEntries(
            currencyKeys.map((currency) => [currency, overrides[currency] ?? 1]),
        ),
    };
}

describe("ensureConversionRates", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    it("returns a patch with only the currencies fetched in this call", async () => {
        vi.spyOn(Date, "now").mockReturnValue(700_000_000);

        const sendMock = vi.mocked(sendExtensionMessage);
        sendMock.mockResolvedValue(
            createRatesResponse("GBP", { USD: 1.25 }) as never,
        );

        const conversionRates = structuredClone(
            defaultGlobalSettings.conversionRates,
        );
        conversionRates.GBP.timestamp = 0;
        conversionRates.USD.timestamp = 700_000_000;

        const result = await ensureConversionRates(conversionRates, [
            "GBP",
            "USD",
        ]);

        expect(sendMock).toHaveBeenCalledTimes(1);
        expect(result.updated).toBe(true);
        expect(result.patch).toEqual({
            GBP: {
                timestamp: 700_000_000,
                rates: createRatesResponse("GBP", { USD: 1.25 }).rates,
            },
        });
        expect(result.conversionRates.GBP.timestamp).toBe(700_000_000);
        expect(result.conversionRates.GBP.rates.USD).toBe(1.25);
        expect(result.patch.USD).toBeUndefined();
    });

    it("skips currencies with fresh rates", async () => {
        vi.spyOn(Date, "now").mockReturnValue(800_000_000);

        const sendMock = vi.mocked(sendExtensionMessage);
        sendMock.mockResolvedValue(
            createRatesResponse("EUR", { USD: 1.08 }) as never,
        );

        const conversionRates = structuredClone(
            defaultGlobalSettings.conversionRates,
        );
        conversionRates.EUR.timestamp = 800_000_000;

        const result = await ensureConversionRates(conversionRates, ["EUR"]);

        expect(sendMock).not.toHaveBeenCalled();
        expect(result.updated).toBe(false);
        expect(result.patch).toEqual({});
        expect(result.conversionRates.EUR.timestamp).toBe(800_000_000);
    });
});
