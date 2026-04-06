import type { GlobalSettings, Settings, SiteSettings } from "@/store/types";
import type {
    SiteSettingsSet,
    GlobalSettingsSet,
    SiteSettingsPatch,
    GlobalSettingsPatch,
    SiteSettingsChange,
    GlobalSettingsChange,
} from "@/store/SettingsStore";
import type { SiteName } from "@/adapters/siteConfigs";
import type { NotificationData } from "@/enhancements/NewSurveyNotificationsEnhancement";

type Namespaced<TGlobal, TSite> =
    | {
          namespace: "globals";
          data: TGlobal;
      }
    | {
          namespace: SiteName;
          data: TSite;
      };

export type StorePatchMessage = Namespaced<
    GlobalSettingsPatch,
    SiteSettingsPatch
>;
export type StorePatchResponse = Namespaced<GlobalSettingsSet, SiteSettingsSet>;

export type StoreSetMessage = Namespaced<GlobalSettingsSet, SiteSettingsSet>;
export type StoreSetResponse = Namespaced<GlobalSettingsSet, SiteSettingsSet>;

export type StoreChangedMessage = Namespaced<
    GlobalSettingsChange,
    SiteSettingsChange
>;

export type StoreFetchMessage = Namespaced<
    { keys: readonly (keyof GlobalSettings)[] },
    { keys: readonly (keyof SiteSettings)[] }
>;
export type StoreFetchResponse = Namespaced<
    Partial<GlobalSettings>,
    Partial<SiteSettings>
>;

export interface StoreMutationMessage {
    "store-set": StoreSetMessage;
    "store-patch": StorePatchMessage;
}

export type StoreMutationMessageType = keyof StoreMutationMessage;

type NotificationMessage = {
    siteName: SiteName;
    notifications: NotificationData[];
    delivery?: "auto" | "provider" | "browser";
};

interface MessageMap extends StoreMutationMessage {
    notification: NotificationMessage;
    "store-fetch": StoreFetchMessage;
    "store-changed": StoreChangedMessage;
    fetch: { url: string };
    network: { url: string; method: string; statusCode: number };
    "survey-completion": { siteName: SiteName; url: string };
}

interface ResponseMap {
    "store-fetch": StoreFetchResponse;
    notification: boolean;
    "store-set": StoreSetResponse;
    "store-patch": StorePatchResponse;
    "store-changed": void;
    fetch: unknown;
    network: void;
    "survey-completion": void;
}

type MessageResponse<K extends keyof MessageMap> = K extends keyof ResponseMap
    ? ResponseMap[K]
    : void;

type HandlerPayload<K extends keyof MessageMap> =
    MessageMap[K] extends undefined ? undefined : MessageMap[K];

type Message<K extends keyof MessageMap = keyof MessageMap> =
    K extends keyof MessageMap
        ? MessageMap[K] extends undefined
            ? { type: K }
            : { type: K; data: MessageMap[K] }
        : never;

export { MessageMap, MessageResponse, HandlerPayload, Message };
