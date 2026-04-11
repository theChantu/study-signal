import { currencyKeysSet, type Currency } from "@/store/types";

const symbolToCurrency: Record<string, Currency> = {
    "£": "GBP",
    $: "USD",
    "€": "EUR",
};

export function getCurrency(symbolOrCode: string): Currency | undefined {
    return (
        symbolToCurrency[symbolOrCode] ??
        (currencyKeysSet.has(symbolOrCode as Currency)
            ? (symbolOrCode as Currency)
            : undefined)
    );
}

export function getCurrencySymbol(currency: Currency) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    })
        .formatToParts(0)
        .find((part) => part.type === "currency")?.value;
}
