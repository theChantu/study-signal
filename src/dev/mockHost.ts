import type { SupportedHosts } from "@/adapters/siteConfigs";

export const MOCK_HOST = "localhost";
export const MOCK_PORT = 5599;

export const MOCK_SITE_HOST = "app.prolific.com" satisfies SupportedHosts;

export const DEV_MOCK_ENABLED = import.meta.env.DEV;

export const DEV_MOCK_MATCHES: string[] = DEV_MOCK_ENABLED
    ? [`http://${MOCK_HOST}/*`]
    : [];

export function isMockLocation(location: {
    hostname: string;
    port: string;
}): boolean {
    return (
        DEV_MOCK_ENABLED &&
        location.hostname === MOCK_HOST &&
        location.port === String(MOCK_PORT)
    );
}
