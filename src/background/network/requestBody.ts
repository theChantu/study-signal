interface RawRequestBody {
    raw?: Array<{
        bytes?: ArrayBuffer;
    }>;
}

function parseJsonRequestBody(
    requestBody: RawRequestBody | undefined,
): unknown | undefined {
    const rawParts = requestBody?.raw ?? [];
    const chunks = rawParts.flatMap((part) =>
        part.bytes ? [new Uint8Array(part.bytes)] : [],
    );

    if (chunks.length === 0) return undefined;

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
    }

    try {
        const text = new TextDecoder().decode(combined);
        return JSON.parse(text);
    } catch {
        return undefined;
    }
}

export { parseJsonRequestBody };
