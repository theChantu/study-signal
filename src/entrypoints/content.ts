import { runContentScript } from "@/content/runContentScript";
import { supportedHosts } from "@/adapters/siteConfigs";
import {
    DEV_MOCK_ENABLED,
    DEV_MOCK_MATCHES,
    MOCK_HOST,
    isMockLocation,
} from "@/dev/mockHost";

export default defineContentScript({
    matches: [
        ...supportedHosts.map((host) => `*://${host}/*`),
        // Dev only, and empty in production builds.
        ...DEV_MOCK_MATCHES,
    ],
    async main(ctx) {
        // Ignore mock host with wrong port.
        if (
            DEV_MOCK_ENABLED &&
            window.location.hostname === MOCK_HOST &&
            !isMockLocation(window.location)
        ) {
            return;
        }

        await runContentScript(ctx);
    },
});
