import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { History, HistorySchema } from './database/history.model';
import { HistoryRepositoryPortToken } from '@domain/histories/ports/history-repository.port';
import { HistoryRepositoryAdapter } from './repositories/history-repository.adapter';
import { AIServicePortToken } from '@domain/histories/ports/ai-service.port';
import { GeminiAdapter } from './services/gemini.adapter';
import {
    AnonymousDailyUsage,
    AnonymousDailyUsageSchema,
} from './database/anonymous-daily-usage.model';
import { AnonymousDailyUsageRepositoryPortToken } from '@domain/histories/ports/anonymous-daily-usage-repository.port';
import { AnonymousDailyUsageRepositoryAdapter } from './repositories/anonymous-daily-usage-repository.adapter';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: History.name,
                schema: HistorySchema,
            },
            {
                name: AnonymousDailyUsage.name,
                schema: AnonymousDailyUsageSchema,
            },
        ]),
    ],
    providers: [
        {
            provide: HistoryRepositoryPortToken,
            useClass: HistoryRepositoryAdapter,
        },
        {
            provide: AIServicePortToken,
            useClass: GeminiAdapter,
        },
        {
            provide: AnonymousDailyUsageRepositoryPortToken,
            useClass: AnonymousDailyUsageRepositoryAdapter,
        },
    ],
    exports: [
        {
            provide: HistoryRepositoryPortToken,
            useClass: HistoryRepositoryAdapter,
        },
        {
            provide: AIServicePortToken,
            useClass: GeminiAdapter,
        },
        {
            provide: AnonymousDailyUsageRepositoryPortToken,
            useClass: AnonymousDailyUsageRepositoryAdapter,
        },
    ],
})
export class InfrastructureModule {}
