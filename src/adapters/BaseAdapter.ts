import { joinURL } from "ufo";

import type { ModuleName } from "./modules/BaseModule";
import type { SupportedSites, sites } from "./sites";

export type UrlSettings<H extends SupportedSites = SupportedSites> =
    (typeof sites)[H] & {
        host: H;
        suffix?: string;
        query?: Record<string, string | number | boolean>;
    };

// TODO: Allow AdapterSettings to inherit these settings based on whatever Module is extended
// e.g., CurrencyConversion would pass enableCurrencyConversion
// enableCurrencyConversion: boolean;
// enableHighlightRates: boolean;
// enableSurveyLinks: boolean;
// enableNewSurveyNotifications: boolean;

type CurrencyInfo = {
    displaySymbol: string | null;
    sourceSymbol: string | null;
};

export abstract class BaseAdapter<H extends SupportedSites = SupportedSites> {
    readonly url: Readonly<UrlSettings<H>>;
    abstract readonly modules: readonly ModuleName[];

    constructor(url: UrlSettings<H>) {
        this.url = url;
    }

    private _moduleSet?: ReadonlySet<ModuleName>;

    hasModule(module: ModuleName): boolean {
        this._moduleSet ??= new Set(this.modules);
        return this._moduleSet.has(module);
    }

    get origin(): string {
        return `https://${this.url.host}`;
    }

    buildUrl(segments: string[]) {
        return joinURL(this.origin, ...segments);
    }

    get iconUrl(): string {
        return this.buildUrl([this.url.iconPath]);
    }

    protected queryText(el: HTMLElement, selector: string): string | null {
        return el.querySelector<HTMLElement>(selector)?.textContent ?? null;
    }

    abstract getSurveyElements(): NodeListOf<HTMLElement>;
    abstract getSurveyContainer(el: HTMLElement): HTMLElement | null;
    abstract getSurveyTitle(el: HTMLElement): string | null;
    abstract getSurveyId(el: HTMLElement): string | null;
    abstract getSurveyResearcher(el: HTMLElement): string | null;

    abstract getInitCurrencyInfo(el: HTMLElement): string | null;
    abstract getCurrencyInfo(el: HTMLElement): CurrencyInfo;

    abstract setHourlyRate(element: HTMLElement): void;

    abstract getCssSettings(): string;
    // TODO: Each adapter will return custom CSS which will be injected within runContentScript.ts
}
