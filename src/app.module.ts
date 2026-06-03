import { Module } from '@nestjs/common';
import { HistoryController } from '@api/controllers/history.controller';
import { AIServicePortToken } from '@domain/histories/ports/ai-service.port';
import { GeminiAdapter } from '@infrastructure/services/gemini.adapter';
import { HistoryRepositoryAdapter } from '@infrastructure/repositories/history-repository.adapter';
import { HistoryRepositoryPortToken } from '@domain/histories/ports/history-repository.port';
import {
    GenerateHistoryUseCase,
    DeactivateHistoriesByUserIdUseCase,
    DeactivateHistoryByIdUseCase,
    GetHistoriesByFilterUseCase,
} from '@application/use-cases';

@Module({
    imports: [],
    controllers: [HistoryController],
    providers: [
        GenerateHistoryUseCase,
        GetHistoriesByFilterUseCase,
        DeactivateHistoryByIdUseCase,
        DeactivateHistoriesByUserIdUseCase,
        {
            provide: HistoryRepositoryPortToken,
            useClass: HistoryRepositoryAdapter,
        },
        {
            provide: AIServicePortToken,
            useClass: GeminiAdapter,
        },
    ],
})
export class AppModule {}
