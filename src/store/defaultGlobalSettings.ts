import type { GlobalSettings } from "./types";

const defaultGlobalSettings = Object.freeze({
    enableDebug: false,
    idleThreshold: 15 * 60,
    providers: {},
}) satisfies GlobalSettings;

const defaultGlobalSettingsKeys = Object.keys(
    defaultGlobalSettings,
) as (keyof typeof defaultGlobalSettings)[];

export { defaultGlobalSettings, defaultGlobalSettingsKeys };
