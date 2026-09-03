export const HistoryType = {
    QUERY: 'query',
    SUBSCRIPTION: 'subscription',
} as const;

export type HistoryType = (typeof HistoryType)[keyof typeof HistoryType];
