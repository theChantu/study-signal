import { showToast } from "../toastStore";
import { sendExtensionMessage } from "@/messages/sendExtensionMessage";

import type { ActiveSiteState, TestNotificationDelivery } from "../types";

async function notifyTestNotification(
    activeSite: ActiveSiteState,
    delivery: TestNotificationDelivery,
): Promise<boolean> {
    try {
        return await sendExtensionMessage({
            type: "notification",
            data: {
                siteName: activeSite.name,
                notifications: [
                    {
                        title: "Test Notification",
                        message: "This is a test notification.",
                        link: "https://example.com",
                        iconUrl: browser.runtime.getURL("/icon-48.png"),
                    },
                ],
                delivery,
            },
        });
    } catch (error) {
        console.error("Failed to send test notification:", error);
        return false;
    }
}

export async function handleTestNotification(
    activeSite: ActiveSiteState,
    delivery: TestNotificationDelivery = "auto",
) {
    const success = await notifyTestNotification(activeSite, delivery);
    showToast(
        success
            ? "Notification sent successfully."
            : "Failed to send notification.",
    );
}
