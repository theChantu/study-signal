import { handleApplyMutation } from "./handleApplyMutation";
import { sites, supportedHosts } from "@/adapters/siteConfigs";
import { settingsState } from "../state.svelte";

import type { MessageMap, StoreMutationMessageType } from "@/messages/types";

export let pendingMutation: Promise<void> = Promise.resolve();

export function handleQueueMutation<T extends StoreMutationMessageType>(
    type: T,
    values: MessageMap[T],
): Promise<void> {
    pendingMutation = pendingMutation
        .then(async () => {
            const result = await handleApplyMutation(type, values);
            if (result.namespace === "globals") {
                settingsState.globals = {
                    ...settingsState.globals,
                    ...result.data,
                };
                return;
            }

            const siteUrl = supportedHosts.find(
                (url) => sites[url].name === result.entry,
            );
            if (!siteUrl) return;

            const current = settingsState.sites[siteUrl];
            if (!current) return;

            settingsState.sites[siteUrl] = {
                ...current,
                ...result.data,
            };
        })
        .catch((error) => {
            console.error(error);
        });

    return pendingMutation;
}
