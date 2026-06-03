import { Body, Controller, Get, Post, Query, Res, Patch, Param } from '@nestjs/common';
import express from 'express';
import {
    GenerateHistoryUseCase,
    DeactivateHistoriesByUserIdUseCase,
    DeactivateHistoryByIdUseCase,
    GetHistoriesByFilterUseCase,
} from '@application/use-cases';
import {
    GenerateHistoryRequestDTO,
    GenerateHistoryResponseDTO,
    GetHistoriesByFilterRequestDTO,
    GetHistoriesByFilterResponseDTO,
} from '../dtos';
import { ErrorCodeMapper } from '@api/utils/error-code.mapper';
import { DeactivateHistoryByIdRequestDTO } from '@api/dtos/deactivate-history-by-id.dto';
import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
} from '@nestjs/swagger';
import { ErrorEntity } from '@domain/abstractions/error.entity';

@Controller({ path: 'history', version: '1' })
export class HistoryController {
    constructor(
        private readonly generateHistoryUseCase: GenerateHistoryUseCase,
        private readonly getHistoriesByFilterUseCase: GetHistoriesByFilterUseCase,
        private readonly deactivateHistoryByIdUseCase: DeactivateHistoryByIdUseCase,
        private readonly deactivateHistoriesByUserIdUseCase: DeactivateHistoriesByUserIdUseCase,
    ) {}

    @Post('generate')
    @ApiOperation({ summary: 'Generate a new history based on provided criteria' })
    @ApiCreatedResponse({
        description: 'History generated successfully',
        type: GenerateHistoryResponseDTO,
    })
    @ApiBadRequestResponse({
        description: 'Validation or domain error',
        type: ErrorEntity,
    })
    @ApiInternalServerErrorResponse({
        description: 'Unhandled server error',
        type: ErrorEntity,
    })
    async generateHistory(
        @Body() body: GenerateHistoryRequestDTO,
        @Res() response: express.Response,
    ) {
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
    @ApiOperation({ summary: 'Get histories based on provided filters' })
    @ApiOkResponse({
        description: 'Histories found',
        type: GetHistoriesByFilterResponseDTO,
    })
    @ApiInternalServerErrorResponse({
        description: 'Unhandled server error',
        type: ErrorEntity,
    })
    async getHistoriesByFilter(
        @Query() filter: GetHistoriesByFilterRequestDTO,
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

        response.status(200).json({
            histories: result.Value.map((history) => ({
                id: history.id,
                content: history.content,
                date: history.date,
                theme: history.theme,
                character: history.character,
                generateAt: history.generateAt,
            })),
        });
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Deactivate a history by its ID' })
    @ApiOkResponse({
        description: 'History deactivated successfully',
        type: ErrorEntity,
    })
    @ApiBadRequestResponse({
        description: 'Validation or domain error',
        type: ErrorEntity,
    })
    @ApiInternalServerErrorResponse({
        description: 'Unhandled server error',
        type: ErrorEntity,
    })
    async deactivateHistoryById(
        @Param() params: DeactivateHistoryByIdRequestDTO,
        @Res() response: express.Response,
    ) {
        const result = await this.deactivateHistoryByIdUseCase.execute(params.id);

        if (result.isFailure) {
            const error = result.error;
            response.status(ErrorCodeMapper.toHttpStatusCode(error.code)).json({ ...error });
            return;
        }

        response.status(200).json({ message: 'History deactivated successfully' });
    }

    @Patch('deactivate-by-user')
    @ApiOperation({ summary: 'Deactivate histories by user ID' })
    @ApiOkResponse({
        description: 'Histories deactivated successfully',
        type: ErrorEntity,
    })
    @ApiInternalServerErrorResponse({
        description: 'Unhandled server error',
        type: ErrorEntity,
    })
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
