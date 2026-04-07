import type { GlobalSettings, SiteSettings } from "@/store/types";
import type { SiteName, SupportedHosts } from "@/adapters/siteConfigs";
import type { NotificationMessage } from "@/messages/types";

export type SettingsState = {
    globals: GlobalSettings;
    sites: Partial<Record<SupportedHosts, SiteSettings>>;
};

export type ActiveSiteState = {
    url: SupportedHosts;
    name: SiteName;
    settings?: SiteSettings;
};

export type GlobalResetKey = Exclude<keyof GlobalSettings, "enableDebug">;
export type SiteResetKey = keyof SiteSettings;

export type TestNotificationDelivery = NotificationMessage["delivery"];
