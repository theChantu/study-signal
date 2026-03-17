export interface SiteInfo {
    name: string;
    surveyPath: string;
    iconPath: string;
}

export const sites = {
    "app.prolific.com": {
        name: "prolific",
        surveyPath: "/studies",
        iconPath: "/apple-touch-icon.png",
    },
    "connect.cloudresearch.com": {
        name: "cloudresearch",
        surveyPath: "/participant/dashboard",
        iconPath: "/participant/favicon.ico",
    },
} as const satisfies Record<string, SiteInfo>;

export type SupportedSites = keyof typeof sites;
export type SiteName = (typeof sites)[SupportedSites]["name"];

export const supportedSites = Object.keys(sites) as SupportedSites[];
