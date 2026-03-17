import { defineConfig } from "wxt";
import { supportedSites } from "./src/adapters/sites";

const hostPermissions = supportedSites.map(
    (site) => `https://${site}/*` as const,
);

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: "src",
    modulesDir: "wxt-modules",
    modules: ["@wxt-dev/module-svelte"],
    manifest: {
        host_permissions: hostPermissions,
        permissions: ["storage", "notifications", "tabs"],
    },
});
