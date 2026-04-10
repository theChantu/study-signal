import { onExtensionMessage } from "@/messages/onExtensionMessage";
import { playNotificationSound } from "@/lib/playNotificationSound";

onExtensionMessage("play-sound", async ({ sound, volume }) => {
    await playNotificationSound({
        type: sound,
        volume: volume,
    });
});
