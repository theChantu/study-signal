import { ProlificAdapter, CloudResearchAdapter } from "../adapters";

const siteAdapters = [new ProlificAdapter(), new CloudResearchAdapter()];

function matchesHost(host: string, allowedHost: string): boolean {
    return host === allowedHost || host.endsWith(`.${allowedHost}`);
}

function getSiteAdapter() {
    const host = window.location.hostname;

    for (const adapter of siteAdapters) {
        if (matchesHost(host, adapter.url.host)) {
            return adapter;
        }
    }

    throw new Error(`Extension injected on unsupported host: ${host}`);
}

export default getSiteAdapter;
