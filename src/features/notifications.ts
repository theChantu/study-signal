import store from "../store/store";
import { getSharedResources } from "../utils";
import { NOTIFY_TTL_MS } from "../constants";
import type { Enhancement } from "../types";

async function saveSurveyFingerprints(fingerprints: string[]) {
    const now = Date.now();

    const { surveys: immutableSurveys } = await store.get(["surveys"]);
    const oldSurveys = structuredClone(immutableSurveys);

    // Remove old surveys that have exceeded the TTL
    for (const [key, timestamp] of Object.entries(oldSurveys)) {
        if (now - timestamp >= NOTIFY_TTL_MS) {
            delete oldSurveys[key];
        }
    }

    const newSurveys = [];
    // Add new surveys to the store with the current timestamp
    for (const fingerprint of fingerprints) {
        if (!oldSurveys[fingerprint]) {
            oldSurveys[fingerprint] = now;
            newSurveys.push(fingerprint);
        }
    }

    await store.set({ surveys: oldSurveys });
    return newSurveys;
}

class NewSurveyNotificationsEnhancement implements Enhancement {
    async apply() {
        const surveys = document.querySelectorAll<HTMLElement>(
            'li[data-testid^="study-"]',
        );
        if (surveys.length === 0) return;
        const assets = await getSharedResources();

        const surveyFingerprints = Array.from(surveys)
            .map((survey) =>
                survey.getAttribute("data-testid")?.replace("study-", ""),
            )
            .filter((id): id is string => id !== undefined);
        const newSurveys = await saveSurveyFingerprints(surveyFingerprints);

        for (const survey of surveys) {
            const surveyId = survey
                .getAttribute("data-testid")
                ?.replace("study-", "");
            if (!surveyId) continue;
            const isNewFingerprint = newSurveys.includes(surveyId);
            if (!isNewFingerprint || !document.hidden) continue;

            const surveyTitle =
                survey.querySelector("h2.title")?.textContent || "New Survey";
            const surveyReward =
                survey.querySelector("span.reward")?.textContent ||
                "Unknown Reward";
            if (!surveyId) continue;
            const surveyLink = `https://app.prolific.com/studies/${surveyId}`;
            GM.notification({
                title: surveyTitle,
                text: surveyReward,
                image: assets["prolific_logo"],
                onclick: () =>
                    GM.openInTab(surveyLink, {
                        active: true,
                    }),
            });
        }
    }

    revert() {
        // No cleanup necessary for notifications
    }
}

const newSurveyNotificationsEnhancement =
    new NewSurveyNotificationsEnhancement();

export { newSurveyNotificationsEnhancement };
