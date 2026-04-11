export interface AdapterEventMap {
    studyCompletion: {
        url: string;
    };
}

export type NetworkRequestBodyMatcher =
    | {
          equals: Record<string, unknown>;
      }
    | {
          field: string;
          in: readonly unknown[];
      };

export interface NetworkEventMatcher {
    path: string;
    method?: string;
    requestBody?: NetworkRequestBodyMatcher;
}

export type AdapterEventType = keyof AdapterEventMap;
