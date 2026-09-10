import { Module } from '@nestjs/common';
import {
    DeactivateHistoriesByUserIdUseCase,
    DeactivateHistoryByIdUseCase,
    GenerateHistoryUseCase,
    GenerateAnonymousHistoryUseCase,
    GetAnonymousHistoriesUseCase,
    GetHistoriesByFilterUseCase,
} from './use-cases';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { AnonymousGenerationConfig } from './anonymous-generation.config';
import { AnonymousVisitorKeyService } from './anonymous-visitor-key.service';
import {
    AnonymousGenerationClockToken,
    SystemAnonymousGenerationClock,
} from './anonymous-generation.clock';

@Module({
    imports: [InfrastructureModule],
    exports: [
        GenerateHistoryUseCase,
        GenerateAnonymousHistoryUseCase,
        GetAnonymousHistoriesUseCase,
        GetHistoriesByFilterUseCase,
        DeactivateHistoryByIdUseCase,
        DeactivateHistoriesByUserIdUseCase,
    ],
    providers: [
        GenerateHistoryUseCase,
        GenerateAnonymousHistoryUseCase,
        GetAnonymousHistoriesUseCase,
        GetHistoriesByFilterUseCase,
        DeactivateHistoryByIdUseCase,
        DeactivateHistoriesByUserIdUseCase,
        AnonymousGenerationConfig,
        AnonymousVisitorKeyService,
        {
            provide: AnonymousGenerationClockToken,
            useClass: SystemAnonymousGenerationClock,
        },
    ],
})
export class ApplicationModule {}
