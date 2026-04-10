export function isMissingReceiverError(error: unknown): boolean {
    return (
        error instanceof Error &&
        error.message.includes("Receiving end does not exist")
    );
}
