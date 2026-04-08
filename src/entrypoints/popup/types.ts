import type { GlobalSettings, SiteSettings } from "@/store/types";
import type { SiteName, SupportedHosts } from "@/adapters/siteConfigs";

export type SettingsState = {
    globals: GlobalSettings;
    sites: Partial<Record<SupportedHosts, SiteSettings>>;
};

export type ActiveSiteState = {
    url: SupportedHosts;
    name: SiteName;
    settings?: SiteSettings;
};

export type SettingComponentProps = {
    activeSite: ActiveSiteState;
    settingsState: SettingsState;
};

export type ToggleControlComponentProps = {
    value: boolean;
    onToggle: () => void;
};
