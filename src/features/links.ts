import Enhancement from "./enhancement";

class SurveyLinksEnhancement extends Enhancement {
    constructor() {
        super();
    }

    apply() {
        const surveys = this.siteAdapter.getSurveyElements();
        for (const survey of surveys) {
            const surveyId = this.siteAdapter.getSurveyId(survey);
            const studyContent = this.siteAdapter.getSurveyContainer(survey);
            if (studyContent && !studyContent.querySelector(".pe-link")) {
                const container = document.createElement("div");
                const link = document.createElement("a");
                container.className = "pe-btn-container";
                container.appendChild(link);
                link.className = "pe-link pe-custom-btn";
                link.href = `https://app.prolific.com/studies/${surveyId}`;
                link.textContent = "Take part in this study";
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                studyContent.appendChild(container);
            }
        }
    }

    revert() {
        const elements = document.querySelectorAll(".pe-btn-container");
        for (const el of elements) {
            if (!el) continue;
            el.remove();
        }
    }
}

const surveyLinksEnhancement = new SurveyLinksEnhancement();
export { surveyLinksEnhancement };
