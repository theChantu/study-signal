import { sendExtensionMessage } from "@/messages/sendExtensionMessage";

import type {
    Message,
    MessageMap,
    MessageResponse,
    StoreMutationMessageType,
} from "@/messages/types";

type PopupMutationType = Exclude<StoreMutationMessageType, "store-fetch">;

export async function applyMutation<T extends PopupMutationType>(
    type: T,
    data: MessageMap[T],
): Promise<MessageResponse<T>> {
    return await sendExtensionMessage({
        type,
        data,
    } as Message<T>);
}
