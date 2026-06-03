import { Body, Controller, Get, Post, Query, Res, Patch, Param } from '@nestjs/common';
import express from 'express';
import {
    GenerateHistoryUseCase,
    DeactivateHistoriesByUserIdUseCase,
    DeactivateHistoryByIdUseCase,
    GetHistoriesByFilterUseCase,
} from '@application/use-cases';
import { GenerateHistoryDTO, GetHistoriesByFilterDTO } from '../dtos';
import { ErrorCodeMapper } from '@api/utils/error-code.mapper';

@Controller('history')
export class HistoryController {
    constructor(
        private readonly generateHistoryUseCase: GenerateHistoryUseCase,
        private readonly getHistoriesByFilterUseCase: GetHistoriesByFilterUseCase,
        private readonly deactivateHistoryByIdUseCase: DeactivateHistoryByIdUseCase,
        private readonly deactivateHistoriesByUserIdUseCase: DeactivateHistoriesByUserIdUseCase,
    ) {}

    @Post('generate')
    async generateHistory(@Body() body: GenerateHistoryDTO, @Res() response: express.Response) {
        const result = await this.generateHistoryUseCase.execute({
            userId: 'some-user-id', // This should come from authenticated user context
            ...body,
        });

        if (result.isFailure) {
            const error = result.error;
            response.status(ErrorCodeMapper.toHttpStatusCode(error.code)).json({ ...error });
            return;
        }

        response.status(201).json({ history: result.Value });
    }

    @Get('list')
    async getHistoriesByFilter(
        @Query() filter: GetHistoriesByFilterDTO,
        @Res() response: express.Response,
    ) {
        const result = await this.getHistoriesByFilterUseCase.execute({
            userId: 'some-user-id', // This should come from authenticated user context
            ...filter,
        });

        if (result.isFailure) {
            const error = result.error;
            response.status(ErrorCodeMapper.toHttpStatusCode(error.code)).json({ ...error });
            return;
        }

        response.status(200).json({ histories: result.Value });
    }

    @Patch(':id')
    async deactivateHistoryById(@Param('id') id: string, @Res() response: express.Response) {
        const result = await this.deactivateHistoryByIdUseCase.execute(id);

        if (result.isFailure) {
            const error = result.error;
            response.status(ErrorCodeMapper.toHttpStatusCode(error.code)).json({ ...error });
            return;
        }

        response.status(200).json({ message: 'History deactivated successfully' });
    }

    @Patch('deactivate-by-user')
    async deactivateHistoriesByUserId(@Res() response: express.Response) {
        const userId = 'some-user-id'; // This should come from authenticated user context
        const result = await this.deactivateHistoriesByUserIdUseCase.execute(userId);

        if (result.isFailure) {
            const error = result.error;
            response.status(ErrorCodeMapper.toHttpStatusCode(error.code)).json({ ...error });
            return;
        }

        response.status(200).json({ message: 'Histories deactivated successfully' });
    }
}
