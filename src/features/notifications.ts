import store from "../store/store";
import { capitalize } from "../lib/utils";
import { NOTIFY_TTL_MS } from "../constants";
import Enhancement from "./enhancement";
import getSiteResources from "../lib/getSiteResources";

async function saveSurveyFingerprints(fingerprints: string[]) {
    const now = Date.now();

    const { surveys: immutableSurveys } = await store.get(["surveys"]);
    const prevSurveys = structuredClone(immutableSurveys);

    let changed = false;
    // TTL removals
    for (const [key, timestamp] of Object.entries(prevSurveys)) {
        if (now - timestamp >= NOTIFY_TTL_MS) {
            delete prevSurveys[key];
            changed = true;
        }
    }

    const newSurveys = [];
    for (const fingerprint of fingerprints) {
        if (!(fingerprint in prevSurveys)) {
            newSurveys.push(fingerprint);
        }
        prevSurveys[fingerprint] = now;
        changed = true;
    }

    if (changed) await store.set({ surveys: prevSurveys });

    return newSurveys;
}

class NewSurveyNotificationsEnhancement extends Enhancement {
    async apply() {
        const surveys = this.adapter.getSurveyElements();
        if (surveys.length === 0) return;

        const assets = await getSiteResources();
        const surveyFingerprints = this.extractSurveyFingerprints(surveys);
        const newSurveys = await saveSurveyFingerprints(surveyFingerprints);

        for (const survey of surveys) {
            const surveyId = this.adapter.getSurveyId(survey);
            if (!surveyId || !newSurveys.includes(surveyId) || !document.hidden)
                continue;

            GM.notification(this.buildNotification(survey, surveyId, assets));
        }
    }

    private extractSurveyFingerprints(surveys: NodeListOf<HTMLElement>) {
        return Array.from(surveys)
            .map((survey) => this.adapter.getSurveyId(survey))
            .filter((id): id is string => id !== undefined);
    }

    private buildNotification(
        survey: HTMLElement,
        surveyId: string,
        assets: Awaited<ReturnType<typeof getSiteResources>>,
    ) {
        const surveyTitle = this.adapter.getStudyTitle(survey)?.textContent;
        const rewardElement = this.adapter.getRewardElement(survey);
        const { displaySymbol } = this.adapter.getCurrencyInfo(rewardElement);
        const rewardText =
            rewardElement?.textContent?.match(/\d+(\.\d+)?/)?.[0] ??
            "Unknown reward";

        const { path, suffix } = this.adapter.url;
        const surveyLink = this.adapter.buildUrl([
            path,
            surveyId,
            ...(suffix ? [suffix] : []),
        ]);

        const siteLabel = capitalize(this.adapter.siteName);

        return {
            title: surveyTitle || siteLabel,
            text: `${siteLabel} • ${displaySymbol}${rewardText}`,
            image: assets[this.adapter.siteName],
            onclick: () =>
                GM.openInTab(surveyLink, {
                    active: true,
                }),
        };
    }

    revert() {
        // No cleanup necessary for notifications
    }
}

const newSurveyNotificationsEnhancement =
    new NewSurveyNotificationsEnhancement();

export { newSurveyNotificationsEnhancement };
