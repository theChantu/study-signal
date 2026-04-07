import { showActionToast } from "../toastStore";
import { handleQueueMutation } from "./handleQueueMutation";
import { defaultGlobalSettings } from "@/store/defaultGlobalSettings";
import { defaultSiteSettings } from "@/store/defaultSiteSettings";

import type {
    SiteResetKey,
    GlobalResetKey,
    ActiveSiteState,
    SettingsState,
} from "../types";

export function formatKey(key: string) {
    return key.replace(/([A-Z])/g, " $1").toLowerCase();
}

export function handleResetGlobalKey(
    globals: SettingsState["globals"],
    key: GlobalResetKey,
) {
    const previous = structuredClone(globals?.[key]);
    const next = structuredClone(defaultGlobalSettings[key]);

    void handleQueueMutation("store-set", {
        namespace: "globals",
        data: { [key]: next },
    });

    showActionToast({
        message: `Reset ${formatKey(key)}.`,
        actionLabel: "Undo",
        onAction: () =>
            previous !== undefined
                ? handleQueueMutation("store-set", {
                      namespace: "globals",
                      data: { [key]: previous },
                  })
                : Promise.resolve(),
    });
}

export function handleResetSiteKey(
    activeSite: ActiveSiteState,
    key: SiteResetKey,
) {
    if (!activeSite.settings) return;

    const previous = structuredClone(activeSite.settings[key]);
    const next = structuredClone(defaultSiteSettings[key]);

    void handleQueueMutation("store-set", {
        namespace: "sites",
        entry: activeSite.name,
        data: { [key]: next },
    });

    showActionToast({
        message: `Reset ${formatKey(key)}.`,
        actionLabel: "Undo",
        onAction: () =>
            handleQueueMutation("store-set", {
                namespace: "sites",
                entry: activeSite.name,
                data: { [key]: previous },
            }),
    });
}
