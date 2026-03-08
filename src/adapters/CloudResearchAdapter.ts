import { BaseAdapter } from "./Adapter";
import { extractSymbol } from "../utils";

import type { AdapterSettings } from "./Adapter";

const CLOUD_RESEARCH_SETTINGS: AdapterSettings = {
    enableInterval: true,
};

//     "div.project-card",
//     "project-card-",
//     "div.project-card",
//     "body",
//     '[class*="project-pay-per-hour-"] span.font-bold',
//     '[class*="project-pay-per-hour-"]',

export class CloudResearchAdapter extends BaseAdapter {
    constructor(overrides: Partial<AdapterSettings> = {}) {
        super(CLOUD_RESEARCH_SETTINGS, overrides);
    }

    getSurveyElements() {
        return document.querySelectorAll<HTMLElement>("div.project-card");
    }

    getSurveyId(el: Element) {
        const surveyId = Array.from(el.classList).find((className) =>
            className.includes("project-card-"),
        );
        if (surveyId) return surveyId.replace("project-card-", "");
        return null;
    }

    getSurveyContainer(el: HTMLElement) {
        return el.querySelector<HTMLElement>("div.project-card");
    }

    getInitCurrencyInfo(el: HTMLElement) {
        return "$";
    }

    getCurrencyInfo(el: HTMLElement) {
        let displaySymbol = Array.from(el.classList).find((className) =>
            className.includes("current-"),
        );
        if (displaySymbol)
            displaySymbol = displaySymbol.replace("current-", "");

        return {
            displaySymbol: displaySymbol || null,
            // CloudResearch uses USD by default
            sourceSymbol: "$",
        };
    }

    getRewardElements() {
        return Array.from(
            document.querySelectorAll<HTMLElement>(
                '[class*="project-pay-per-hour-"]',
            ),
        );
    }

    getHourlyRateElements() {
        return Array.from(
            document.querySelectorAll<HTMLElement>(
                '[class*="project-pay-per-hour-"]',
            ),
        ).filter((node) => node.textContent.includes("per hour"));
    }

    setHourlyRate(element: HTMLElement) {}
}

// The Adapters (e.g., CloudResearchAdapter.ts): Only allowed to touch the DOM. They find the weird HTML elements and return them. No math allowed.

// The Enhancements (e.g., CurrencyConverter.ts): Only allowed to do logic. They ask the Adapter for elements, do the math, and update the text.

// The Router (e.g., main.ts): Looks at the URL, creates the right Adapter, checks your settings, and runs the Enhancements.
