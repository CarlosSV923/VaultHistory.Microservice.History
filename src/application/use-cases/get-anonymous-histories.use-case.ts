import { Inject, Injectable } from '@nestjs/common';
import { ResultEntity } from '@domain/abstractions/result.entity';
import type { HistoryPage, HistoryRepositoryPort } from '@domain/histories/ports/history-repository.port';
import { HistoryRepositoryPortToken } from '@domain/histories/ports/history-repository.port';
import { AnonymousVisitorKeyService } from '../anonymous-visitor-key.service';

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
        private readonly anonymousVisitorKeyService: AnonymousVisitorKeyService,
    ) {}

    async execute(params: GetAnonymousHistoriesParams): Promise<ResultEntity<HistoryPage>> {
        const anonymousVisitorKeys = this.anonymousVisitorKeyService.createLookupKeys(params.ip);
        if (anonymousVisitorKeys.isFailure) return ResultEntity.failure(anonymousVisitorKeys.error);
        return this.historyRepositoryPort.getAnonymousHistoriesByFilter({
            anonymousVisitorKeys: anonymousVisitorKeys.Value,
            page: params.page,
            pageSize: params.pageSize,
        });
    }
}
