import { BaseAdapter, DataAttr } from "./BaseAdapter";
import { extractSymbol } from "../lib/utils";
import { sites } from "./siteConfigs";

const HOST = "app.prolific.com";

export class ProlificAdapter extends BaseAdapter<typeof HOST> {
    constructor() {
        super({ ...sites[HOST], host: HOST });
    }

    getSurveyElements() {
        return document.querySelectorAll<HTMLElement>(
            'li[data-testid^="study-"]',
        );
    }

    getSurveyId(el: HTMLElement) {
        return el.getAttribute("data-testid")?.replace("study-", "") ?? null;
    }

    getSurveyContainer(el: HTMLElement) {
        return el.querySelector<HTMLElement>("div.study-content");
    }

    getSurveyTitle(el: HTMLElement) {
        return this.queryText(el, "h2");
    }

    getSurveyResearcher(el: HTMLElement): string | null {
        return this.queryText(el, '[aria-labelledby*="host-name-"]');
    }

    getSourceSymbol(el: HTMLElement) {
        return extractSymbol(el.textContent);
    }

    getRewardElements() {
        return Array.from(
            document.querySelectorAll<HTMLElement>(
                "[data-testid='study-tag-reward-per-hour'], [data-testid='study-tag-reward'], ul.info-hint li span.amount",
            ),
        );
    }

    getRewardElement(el: HTMLElement) {
        return el.querySelector<HTMLElement>(
            "[data-testid='study-tag-reward']",
        );
    }

    getHourlyRateElements() {
        return Array.from(
            document.querySelectorAll<HTMLElement>(
                "[data-testid='study-tag-reward-per-hour']",
            ),
        );
    }

    getHourlyRateElement(el: HTMLElement) {
        return el.querySelector<HTMLElement>(
            "[data-testid='study-tag-reward-per-hour']",
        );
    }

    setHourlyRate(element: HTMLElement): void {}
}
