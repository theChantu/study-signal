import { defaultSiteSettings } from "./defaultSiteSettings";
import { defaultGlobalSettings } from "./defaultGlobalSettings";

import type { GlobalSettings, SiteSettings } from "./types";

const defaultSettings = Object.freeze({
    ...defaultSiteSettings,
    ...defaultGlobalSettings,
}) satisfies SiteSettings & GlobalSettings;

export { defaultSettings };
