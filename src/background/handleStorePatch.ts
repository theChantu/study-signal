import type { StorePatchMessage, StorePatchResponse } from "@/messages/types";
import type { SettingsStore } from "@/store/store";

export async function handleStorePatch(
    store: SettingsStore,
    payload: StorePatchMessage,
): Promise<StorePatchResponse> {
    if (payload.namespace === "globals") {
        const data = await store.globals.patch(payload.data);
        return { namespace: "globals", data };
    }

    const data = await store.site(payload.namespace).patch(payload.data);
    return { namespace: payload.namespace, data };
}
