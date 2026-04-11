export interface NetworkRequestEvent {
    url: string;
    method: string;
    statusCode: number;
    requestBody?: unknown;
}
