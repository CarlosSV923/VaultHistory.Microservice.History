import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { History, HistorySchema } from './database/history.model';
import { HistoryRepositoryPortToken } from '@domain/histories/ports/history-repository.port';
import { HistoryRepositoryAdapter } from './repositories/history-repository.adapter';
import { AIServicePortToken } from '@domain/histories/ports/ai-service.port';
import { GeminiAdapter } from './services/gemini.adapter';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: History.name,
                schema: HistorySchema,
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
    ],
})
export class InfrastructureModule {}
