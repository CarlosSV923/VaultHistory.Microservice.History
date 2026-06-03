import { Inject, Injectable } from '@nestjs/common';
import { ResultEntity } from '@domain/abstractions/result.entity';
import { HistoryEntity } from '@domain/histories/history.entity';
import type { AIServicePort } from '@domain/histories/ports/ai-service.port';
import { AIServicePortToken, GenerateContentParams } from '@domain/histories/ports/ai-service.port';
import type { HistoryRepositoryPort } from '@domain/histories/ports/history-repository.port';
import { HistoryRepositoryPortToken } from '@domain/histories/ports/history-repository.port';

@Injectable()
export class GenerateHistoryUseCase {
    constructor(
        @Inject(HistoryRepositoryPortToken)
        private readonly historyRepositoryPort: HistoryRepositoryPort,
        @Inject(AIServicePortToken)
        private readonly aiServicePort: AIServicePort,
    ) {}
    async execute(params: GenerateContentParams): Promise<ResultEntity<string>> {
        const contentResult = await this.aiServicePort.generateContent(params);

        if (contentResult.isFailure) {
            return ResultEntity.failure(contentResult.error);
        }

        const newHistory = new HistoryEntity(
            null,
            params.userId,
            contentResult.Value,
            params.date,
            params.theme,
            params.character,
        );

        const saveResult = await this.historyRepositoryPort.saveHistory(newHistory);

        if (saveResult.isFailure) {
            return ResultEntity.failure(saveResult.error);
        }

        return ResultEntity.success(contentResult.Value);
    }
}
