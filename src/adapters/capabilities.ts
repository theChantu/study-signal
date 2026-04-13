export type StudyDevice = "desktop" | "tablet" | "phone";

export type StudyPeripheral =
    | "audio"
    | "microphone"
    | "camera"
    | "writing"
    | "download";

function pattern(...text: string[]) {
    return new RegExp(`\\b(${text.join("|")})\\b`);
}

export const DEVICE_PATTERNS: Record<StudyDevice, readonly RegExp[]> = {
    desktop: [pattern("desktop"), pattern("laptop")],
    tablet: [pattern("tablet")],
    phone: [pattern("mobile")],
};

export const PERIPHERAL_PATTERNS: Record<StudyPeripheral, readonly RegExp[]> = {
    audio: [pattern("audio")],
    microphone: [pattern("microphone")],
    camera: [pattern("camera"), pattern("webcam"), pattern("video")],
    writing: [pattern("writing"), pattern("pencil")],
    download: [pattern("download")],
};

export function matchCapabilities<T extends string>(
    hints: string[],
    patterns: Record<T, readonly RegExp[]>,
): T[] {
    const normalizedHints = hints.map((hint) => hint.toLowerCase());
    const entries = Object.entries(patterns) as [T, readonly RegExp[]][];

    return entries
        .filter(([, tests]) =>
            normalizedHints.some((hint) =>
                tests.some((pattern) => pattern.test(hint)),
            ),
        )
        .map(([capability]) => capability as T);
}
