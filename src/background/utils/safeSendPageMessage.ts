import { sendExtensionMessage } from "@/messages/sendExtensionMessage";
import { isMissingReceiverError } from "./isMissingReceiverError";

import type { MessageMap, Message } from "@/messages/types";

export async function safeSendPageMessage<K extends keyof MessageMap>(
    message: Message<K>,
): Promise<void> {
    try {
        await sendExtensionMessage(message);
    } catch (error) {
        if (!isMissingReceiverError(error)) {
            console.error("Error sending extension page message:", error);
        }
    }
}
