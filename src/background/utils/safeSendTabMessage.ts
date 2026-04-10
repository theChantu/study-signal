import { sendTabMessage } from "@/messages/sendTabMessage";
import { isMissingReceiverError } from "./isMissingReceiverError";

import type { MessageMap, Message } from "@/messages/types";

export async function safeSendTabMessage<K extends keyof MessageMap>(
    tabId: number,
    message: Message<K>,
    options?: Browser.tabs.MessageSendOptions,
): Promise<void> {
    try {
        await sendTabMessage(tabId, message, options);
    } catch (error) {
        if (!isMissingReceiverError(error)) {
            console.error("Error sending extension tab message:", error);
        }
    }
}
