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
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from '@api/filters/global-exception.filter';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: [`config/.env.${process.env.NODE_ENV}`],
            isGlobal: true,
        }),
    ],
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
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
    ],
})
export class AppModule {}
