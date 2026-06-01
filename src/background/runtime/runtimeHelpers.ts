import {
    sites,
    type SiteName,
    type SupportedHosts,
} from "@/adapters/siteConfigs";
import { isMockLocation, MOCK_SITE_HOST } from "@/dev/mockHost";
import type { RuntimeChannel } from "@/messages/types";

export const runtimeChannels = [
    "opportunities",
] as const satisfies readonly RuntimeChannel[];

export function getRuntimeSyncChannels(
    channels?: RuntimeChannel[],
): RuntimeChannel[] {
    return channels && channels.length > 0
        ? [...channels]
        : [...runtimeChannels];
}

export function getTabSiteName(url?: string | null): SiteName | null {
    if (!url) return null;

    try {
        const { hostname, port } = new URL(url);

        // Dev only return the mock site name for the mock location.
        if (isMockLocation({ hostname, port })) {
            return sites[MOCK_SITE_HOST].name;
        }

        return hostname in sites
            ? sites[hostname as SupportedHosts].name
            : null;
    } catch {
        return null;
    }
}

export function isSupportedHostTabUrl(url?: string | null): boolean {
    return getTabSiteName(url) !== null;
}
