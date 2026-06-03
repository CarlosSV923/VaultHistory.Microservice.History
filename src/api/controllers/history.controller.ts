import { Body, Controller, Post } from '@nestjs/common';
import {
    GenerateHistoryUseCase,
    DeactivateHistoriesByUserIdUseCase,
    DeactivateHistoryByIdUseCase,
    GetHistoriesByFilterUseCase,
} from '@application/use-cases';
import { GenerateHistoryDTO } from '../dtos';

@Controller('history')
export class HistoryController {
    constructor(
        private readonly generateHistoryUseCase: GenerateHistoryUseCase,
        private readonly getHistoriesByFilterUseCase: GetHistoriesByFilterUseCase,
        private readonly deactivateHistoryByIdUseCase: DeactivateHistoryByIdUseCase,
        private readonly deactivateHistoriesByUserIdUseCase: DeactivateHistoriesByUserIdUseCase,
    ) {}

    @Post('generate')
    async generateHistory(@Body() dto: GenerateHistoryDTO) {
        const result = await this.generateHistoryUseCase.execute({
            userId: 'some-user-id', // This should come from authenticated user context
            date: dto.date,
            theme: dto.theme,
            character: dto.character,
        });

        if (result.isFailure) {
            return { success: false, error: result.error };
        }

        return { success: true, data: result.Value };
    }
}
