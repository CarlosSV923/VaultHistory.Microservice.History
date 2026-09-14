import type { ResultEntity } from '../../abstractions/result.entity';

export type AnonymousUsageConsumption = {
    used: number;
    allowed: boolean;
};

export interface AnonymousDailyUsageRepositoryPort {
    consume(anonymousVisitorKey: string, day: string, limit: number): Promise<ResultEntity<AnonymousUsageConsumption>>;
}

export const AnonymousDailyUsageRepositoryPortToken = Symbol('AnonymousDailyUsageRepositoryPort');
