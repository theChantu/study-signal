import type { StudyInfo } from "@/adapters/BaseAdapter";
import type { SiteName, SupportedHosts } from "@/adapters/siteConfigs";
import type {
    MessageMap,
    RuntimeDataMap,
    StoreMutationMessageType,
} from "@/messages/types";
import type { GlobalSettings, SiteSettings } from "@/store/types";

export type SettingsState = {
    globals: GlobalSettings;
    sites: Partial<Record<SupportedHosts, SiteSettings>>;
};

export type PopupTab = "studies" | "settings";

export type UiState = {
    selectedHost: SupportedHosts;
    selectedTab: PopupTab;
};

export type RuntimeState = {
    [K in keyof RuntimeDataMap]: Partial<
        Record<SupportedHosts, RuntimeDataMap[K] | null>
    >;
};

export type ActiveSiteState = {
    url: SupportedHosts;
    name: SiteName;
    settings?: SiteSettings;
};

export type StudyItem = StudyInfo & {
    host: SupportedHosts;
    siteName: SiteName;
    siteLabel: string;
    order: number;
    color: string | null;
};

export type SettingComponentProps = {
    activeSite: ActiveSiteState;
};

export type QueueMutation = <T extends StoreMutationMessageType>(
    type: T,
    values: MessageMap[T],
) => Promise<void>;

type SiteMutationModel = {
    queueMutation: QueueMutation;
    siteName: SiteName;
};

type GlobalMutationModel = {
    queueMutation: QueueMutation;
};

export type HighlightSettingsModel = SiteMutationModel & {
    highlightRates: GlobalSettings["highlightRates"];
};

export type CurrencySettingsModel = SiteMutationModel & {
    currency: GlobalSettings["currency"];
};

export type NotificationSettingsModel = SiteMutationModel & {
    notifications: GlobalSettings["notifications"];
    studyAlerts: SiteSettings["studyAlerts"];
};

export type ProviderSettingsModel = GlobalMutationModel & {
    idleThreshold: GlobalSettings["idleThreshold"];
    providers: GlobalSettings["providers"];
};

export type AutoReloadIntervalSetting = Exclude<
    keyof SiteSettings["autoReload"],
    "enabled"
>;

export type AutoReloadSettingsModel = SiteMutationModel & {
    autoReload: SiteSettings["autoReload"];
};

export type DebugSettingsModel = GlobalMutationModel &
    SettingComponentProps & {
        settingsState: SettingsState;
    };

export type AnalyticsModel = SiteSettings["analytics"];

export type StudiesTabModel = SettingComponentProps & {};

export type SettingsTabModel = SettingComponentProps & {};
