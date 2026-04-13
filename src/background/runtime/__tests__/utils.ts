import type { StudyInfo } from "@/adapters/BaseAdapter";

export function createStudy(
    id: string,
    overrides: Partial<StudyInfo> = {},
): StudyInfo {
    return {
        id,
        title: `Study ${id.toUpperCase()}`,
        researcher: `Researcher ${id.toUpperCase()}`,
        reward: 1,
        rate: 12,
        link: `https://app.prolific.com/studies/${id}`,
        symbol: "$",
        devices: [],
        peripherals: [],
        averageCompletionSeconds: 600,
        slots: 10,
        ...overrides,
    };
}
