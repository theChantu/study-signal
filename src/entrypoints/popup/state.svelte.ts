import { defaultGlobalSettings } from "@/store/defaultGlobalSettings";
import { supportedHosts } from "@/adapters/siteConfigs";

import type { RuntimeState, SettingsState, UiState } from "./types";

export const settingsState: SettingsState = $state({
    globals: defaultGlobalSettings,
    sites: {},
});

export const runtimeState: RuntimeState = $state({
    studies: {},
});

export const uiState: UiState = $state({
    selectedHost: supportedHosts[0],
    selectedTab: "studies",
    detectedHost: null,
});
