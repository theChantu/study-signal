import type { GlobalSettings } from "./types";

const defaultGlobalSettings = Object.freeze({
    enableDebug: false,
}) satisfies GlobalSettings;

export { defaultGlobalSettings };
