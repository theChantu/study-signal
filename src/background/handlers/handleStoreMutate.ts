import {
    StoreMutationMessageType,
    MessageMap,
    ResponseMap,
} from "@/messages/types";
import { SettingsStore } from "@/store/SettingsStore";

type StoreMethod<T extends StoreMutationMessageType> =
    T extends `store-${infer Method extends "set" | "patch"}` ? Method : never;

type StoreMutateFn<T extends StoreMutationMessageType> = (
    data: MessageMap[T]["data"],
) => Promise<ResponseMap[T]["data"]>;

export async function handleStoreMutate<T extends StoreMutationMessageType>(
    store: SettingsStore,
    type: T,
    payload: MessageMap[T],
): Promise<ResponseMap[T]> {
    const method = type.replace("store-", "") as StoreMethod<T>;

    if (payload.namespace === "globals") {
        const fn = store.globals[method] as StoreMutateFn<T>;
        const data = await fn(payload.data);
        return { namespace: "globals", data } as ResponseMap[T];
    }

    const fn = store.sites.entry(payload.entry)[method] as (
        data: typeof payload.data,
    ) => Promise<ResponseMap[T]["data"]>;
    const data = await fn(payload.data);
    return { namespace: "sites", entry: payload.entry, data } as ResponseMap[T];
}
