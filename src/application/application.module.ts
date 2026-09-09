import { Module } from '@nestjs/common';
import {
    DeactivateHistoriesByUserIdUseCase,
    DeactivateHistoryByIdUseCase,
    GenerateHistoryUseCase,
    GenerateAnonymousHistoryUseCase,
    GetHistoriesByFilterUseCase,
} from './use-cases';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { AnonymousGenerationConfig } from './anonymous-generation.config';
import {
    AnonymousGenerationClockToken,
    SystemAnonymousGenerationClock,
} from './anonymous-generation.clock';

@Module({
    imports: [InfrastructureModule],
    exports: [
        GenerateHistoryUseCase,
        GenerateAnonymousHistoryUseCase,
        GetHistoriesByFilterUseCase,
        DeactivateHistoryByIdUseCase,
        DeactivateHistoriesByUserIdUseCase,
    ],
    providers: [
        GenerateHistoryUseCase,
        GenerateAnonymousHistoryUseCase,
        GetHistoriesByFilterUseCase,
        DeactivateHistoryByIdUseCase,
        DeactivateHistoriesByUserIdUseCase,
        AnonymousGenerationConfig,
        {
            provide: AnonymousGenerationClockToken,
            useClass: SystemAnonymousGenerationClock,
        },
    ],
})
export class ApplicationModule {}
