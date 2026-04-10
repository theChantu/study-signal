import { BaseAdapter } from "./BaseAdapter";
import { extractSymbol } from "../lib/utils";
import { sites } from "./siteConfigs";

const HOST = "app.prolific.com";

export class ProlificAdapter extends BaseAdapter<typeof HOST> {
    constructor() {
        super({ ...sites[HOST], host: HOST });
    }

    getStudyElements() {
        return document.querySelectorAll<HTMLElement>(
            'li[data-testid^="study-"]',
        );
    }

    getStudyId(el: HTMLElement) {
        return el.getAttribute("data-testid")?.replace("study-", "") ?? null;
    }

    getStudyContainer(el: HTMLElement) {
        return el.querySelector<HTMLElement>("div.study-content");
    }

    getStudyTitle(el: HTMLElement) {
        return this.queryText(el, "h2");
    }

    getStudyResearcher(el: HTMLElement): string | null {
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
}
