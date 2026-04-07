import { defaultGlobalSettings } from "@/store/defaultGlobalSettings";
import { SettingsState } from "./types";
import { supportedHosts } from "@/adapters/siteConfigs";

export const settingsState: SettingsState = $state({
    globals: defaultGlobalSettings,
    sites: {},
});

export const uiState = $state({
    selectedHost: supportedHosts[0],
});
