import { Inject, Injectable } from '@nestjs/common';
import { ResultEntity } from '@domain/abstractions/result.entity';
import type {
    GetHistoryFilter,
    HistoryPage,
    HistoryRepositoryPort,
} from '@domain/histories/ports/history-repository.port';
import { HistoryRepositoryPortToken } from '@domain/histories/ports/history-repository.port';

@Injectable()
export class GetHistoriesByFilterUseCase {
    constructor(
        @Inject(HistoryRepositoryPortToken)
        private readonly historyRepositoryPort: HistoryRepositoryPort,
    ) {}
    async execute(filter: GetHistoryFilter): Promise<ResultEntity<HistoryPage>> {
        return await this.historyRepositoryPort.getHistoriesByFilter(filter);
    }
}
