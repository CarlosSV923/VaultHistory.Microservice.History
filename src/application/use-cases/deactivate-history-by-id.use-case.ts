import { Inject, Injectable } from '@nestjs/common';
import { ResultEntity } from '@domain/abstractions/result.entity';
import type { HistoryRepositoryPort } from '@domain/histories/ports/history-repository.port';
import { HistoryRepositoryPortToken } from '@domain/histories/ports/history-repository.port';

@Injectable()
export class DeactivateHistoryByIdUseCase {
    constructor(
        @Inject(HistoryRepositoryPortToken)
        private readonly historyRepositoryPort: HistoryRepositoryPort,
    ) {}

    async execute(id: string, userId: string): Promise<ResultEntity<void>> {
        return this.historyRepositoryPort.deactivateById(id, userId);
    }
}
