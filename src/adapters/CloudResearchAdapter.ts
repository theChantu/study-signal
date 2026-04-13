import { BaseAdapter } from "./BaseAdapter";
import { sites } from "./siteConfigs";

const HOST = "connect.cloudresearch.com";

export class CloudResearchAdapter extends BaseAdapter<typeof HOST> {
    constructor() {
        super({ ...sites[HOST], host: HOST });
    }

    getStudyElements() {
        return document.querySelectorAll<HTMLElement>("div.project-card");
    }

    getStudyId(el: Element) {
        const studyId = Array.from(el.classList).find((className) =>
            className.includes("project-card-"),
        );
        if (studyId) return studyId.replace("project-card-", "");
        return null;
    }

    getStudyContainer(el: HTMLElement) {
        return el.querySelector<HTMLElement>("div.project-card");
    }

    getStudyTitle(el: HTMLElement) {
        return this.getText(el, "p");
    }

    getStudyResearcher(el: HTMLElement): string | null {
        return this.getText(el, "label div div:last-child");
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

    getCapabilityHints(el: HTMLElement) {
        const deviceElements = Array.from(
            el.querySelectorAll('[class*="fa-"]'),
        ).filter((el) => el.classList.contains("text-green-600"));

        const peripheralElements = el.querySelectorAll(
            '[class*="fas"].cr-text-secondary',
        );

        return this.collectHints(
            [...deviceElements, ...peripheralElements],
            (el) =>
                Array.from(el.classList).filter((cls) => cls.startsWith("fa-")),
        );
    }

    protected getStudyAverageCompletionText(el: HTMLElement): string | null {
        const parent = el
            .querySelector<HTMLElement>(".fa-clock")
            ?.closest("div");
        return parent ? this.getText(parent) : null;
    }

    protected getStudySlotsText(el: HTMLElement): string | null {
        const parent = el.querySelector(".fa-dot-circle")?.closest("div");
        return parent ? this.getText(parent) : null;
    }
}
