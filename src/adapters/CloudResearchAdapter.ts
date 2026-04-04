import { BaseAdapter } from "./BaseAdapter";
import { sites } from "./siteConfigs";

const HOST = "connect.cloudresearch.com";

export class CloudResearchAdapter extends BaseAdapter<typeof HOST> {
    constructor() {
        super({ ...sites[HOST], host: HOST });
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

    getSurveyTitle(el: HTMLElement) {
        return this.queryText(el, "p");
    }

    getSurveyResearcher(el: HTMLElement): string | null {
        return this.queryText(el, "label div div:last-child");
    }

    getSourceSymbol(el: HTMLElement): string | null {
        // CloudResearch doesn't provide a source currency, but it's always USD
        return "$";
    }

    getRewardElements() {
        return Array.from(
            document.querySelectorAll<HTMLElement>(
                '[class*="project-pay-per-hour-"] > *',
            ),
        );
    }

    getRewardElement(el: HTMLElement) {
        return el.querySelector<HTMLElement>(
            '[class*="project-pay-per-hour-"] > *',
        );
    }

    getHourlyRateElements() {
        return Array.from(
            document.querySelectorAll<HTMLElement>(
                '[class*="project-pay-per-hour-"] > *:last-child',
            ),
        );
    }

    getHourlyRateElement(el: HTMLElement) {
        return el.querySelector<HTMLElement>(
            '[class*="project-pay-per-hour-"] > *:last-child',
        );
    }

    setHourlyRate(element: HTMLElement): void {}
}
