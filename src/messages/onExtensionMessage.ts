import type {
    MessageMap,
    MessageResponse,
    HandlerPayload,
    Message,
} from "./types";

export function onExtensionMessage<K extends keyof MessageMap>(
    type: K,
    handler: (
        payload: HandlerPayload<K>,
        sender: Browser.runtime.MessageSender,
    ) => MessageResponse<K> | Promise<MessageResponse<K>>,
) {
    const listener = (
        message: Message,
        sender: Browser.runtime.MessageSender,
        sendResponse: (response?: MessageResponse<K>) => void,
    ) => {
        if (message.type !== type) return false;

        const payload = (
            "data" in message ? message.data : undefined
        ) as HandlerPayload<K>;

        Promise.resolve(handler(payload, sender))
            .then(sendResponse)
            .catch((error) => {
                console.error(`Error handling "${type}" message:`, error);
                sendResponse();
            });

        return true;
    };

    browser.runtime.onMessage.addListener(listener);

    return () => browser.runtime.onMessage.removeListener(listener);
}
