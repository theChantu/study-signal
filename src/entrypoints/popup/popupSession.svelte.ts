import { queueMutation } from "./popupModel.svelte";
import { settingsState } from "./state.svelte";

import type { RuntimeChangedMessage } from "@/messages/types";

export let sessionSeenAt = Date.now();

function persistSeenAt(now: number): void {
    settingsState.globals.lastPopupOpenedAt = now;
    void queueMutation("store-patch", {
        namespace: "globals",
        data: { lastPopupOpenedAt: now },
    });
}

export function beginPopupSession(): void {
    sessionSeenAt = settingsState.globals.lastPopupOpenedAt;
    persistSeenAt(Date.now());
}

function markSessionSeenNow(): void {
    const now = Date.now();
    sessionSeenAt = now;
    persistSeenAt(now);
}

export function acknowledgeRuntimeChange(
    payload: RuntimeChangedMessage,
): void {
    if (payload.channel !== "studies" || payload.data === null) return;

    if (payload.data.some((study) => study.firstSeenAt > sessionSeenAt)) {
        markSessionSeenNow();
    }
}
