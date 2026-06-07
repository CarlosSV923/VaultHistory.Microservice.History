import { Module } from '@nestjs/common';
import {
    DeactivateHistoriesByUserIdUseCase,
    DeactivateHistoryByIdUseCase,
    GenerateHistoryUseCase,
    GetHistoriesByFilterUseCase,
} from './use-cases';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

@Module({
    imports: [InfrastructureModule],
    exports: [
        GenerateHistoryUseCase,
        GetHistoriesByFilterUseCase,
        DeactivateHistoryByIdUseCase,
        DeactivateHistoriesByUserIdUseCase,
    ],
    providers: [
        GenerateHistoryUseCase,
        GetHistoriesByFilterUseCase,
        DeactivateHistoryByIdUseCase,
        DeactivateHistoriesByUserIdUseCase,
    ],
})
export class ApplicationModule {}
