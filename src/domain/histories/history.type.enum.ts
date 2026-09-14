export const HistoryType = {
    QUERY: 'query',
    SUBSCRIPTION: 'subscription',
    ANONYMOUS: 'anonymous',
} as const;

export type HistoryType = (typeof HistoryType)[keyof typeof HistoryType];
