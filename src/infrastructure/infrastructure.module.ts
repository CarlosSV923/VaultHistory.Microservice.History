import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistorySchema } from './database/history.model';
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
    exports: [HistoryRepositoryPortToken, AIServicePortToken],
})
export class InfrastructureModule {}
