import { Module } from '@nestjs/common';
import {
    DeactivateHistoriesByUserIdUseCase,
    DeactivateHistoryByIdUseCase,
    GenerateHistoryUseCase,
    GetHistoriesByFilterUseCase,
} from './use-cases';

@Module({
    imports: [],
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
