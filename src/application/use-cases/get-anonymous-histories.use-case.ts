import { Inject, Injectable } from '@nestjs/common';
import { ResultEntity } from '@domain/abstractions/result.entity';
import type { HistoryPage, HistoryRepositoryPort } from '@domain/histories/ports/history-repository.port';
import { HistoryRepositoryPortToken } from '@domain/histories/ports/history-repository.port';
import { normalizeAnonymousIp } from '../anonymous-ip.normalizer';

export type GetAnonymousHistoriesParams = {
    ip: string;
    page: number;
    pageSize: number;
};

@Injectable()
export class GetAnonymousHistoriesUseCase {
    constructor(
        @Inject(HistoryRepositoryPortToken)
        private readonly historyRepositoryPort: HistoryRepositoryPort,
    ) {}

    async execute(params: GetAnonymousHistoriesParams): Promise<ResultEntity<HistoryPage>> {
        const normalizedIp = normalizeAnonymousIp(params.ip);
        if (normalizedIp.isFailure) return ResultEntity.failure(normalizedIp.error);
        return this.historyRepositoryPort.getAnonymousHistoriesByFilter({
            anonymousVisitorKeys: [normalizedIp.Value],
            page: params.page,
            pageSize: params.pageSize,
        });
    }
}
