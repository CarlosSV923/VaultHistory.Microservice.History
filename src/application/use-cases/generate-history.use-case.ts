import { Inject, Injectable } from '@nestjs/common';
import { ResultEntity } from '@domain/abstractions/result.entity';
import { HistoryEntity } from '@domain/histories/history.entity';
import type { AIServicePort } from '@domain/histories/ports/ai-service.port';
import { AIServicePortToken, GenerateHistoryParams } from '@domain/histories/ports/ai-service.port';
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
    async execute(params: GenerateHistoryParams): Promise<ResultEntity<string>> {
        const contentResult = await this.aiServicePort.generateContent(params);

        if (contentResult.isFailure) {
            return ResultEntity.failure(contentResult.error);
        }

        const newHistory = HistoryEntity.create({
            userId: params.userId,
            content: contentResult.Value,
            date: params.date,
            theme: params.theme,
            character: params.character,
            type: params.type,
        });

        const saveResult = await this.historyRepositoryPort.saveHistory(newHistory);

        if (saveResult.isFailure) {
            return ResultEntity.failure(saveResult.error);
        }

        return ResultEntity.success(contentResult.Value);
    }
}
