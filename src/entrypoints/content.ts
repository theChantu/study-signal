import { runContentScript } from "@/content/runContentScript";
import { supportedHosts } from "@/adapters/siteConfigs";

export default defineContentScript({
    matches: supportedHosts.map((host) => `*://${host}/*`),
    async main(ctx) {
        await runContentScript(ctx);
    },
});
