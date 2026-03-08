import { ProlificAdapter, CloudResearchAdapter } from "./adapters";

import type { BaseAdapter } from "./adapters";

const siteAdapters = {
    prolific: new ProlificAdapter(),
    cloudresearch: new CloudResearchAdapter(),
} satisfies Record<string, BaseAdapter>;

type SiteAdapterKey = keyof typeof siteAdapters;

function getSiteAdapter(): BaseAdapter {
    const host = window.location.hostname;

    for (const key of Object.keys(siteAdapters) as SiteAdapterKey[]) {
        if (host.includes(key)) return siteAdapters[key];
    }

    throw new Error(`Extension injected on unsupported host: ${host}`);
}

export default getSiteAdapter;
