import { runContentScript } from "@/content/runContentScript";
import { supportedSites } from "@/adapters/sites";

export default defineContentScript({
    matches: supportedSites.map((site) => `*://${site}/*`),
    async main(ctx) {
        await runContentScript(ctx);
    },
});
