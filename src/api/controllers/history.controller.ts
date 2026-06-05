import { Body, Controller, Get, Post, Query, Res, Patch, Param, UseGuards } from '@nestjs/common';
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
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorEntity } from '@domain/abstractions/error.entity';
import { JwtAuthGuard } from '@api/auth/jwt-auth.guard';
import type { AuthenticatedUser } from '@api/auth/authenticated-user';
import { CurrentUser } from '@api/auth/current-user.decorator';

@Controller({ path: 'history', version: '1' })
export class HistoryController {
    constructor(
        private readonly generateHistoryUseCase: GenerateHistoryUseCase,
        private readonly getHistoriesByFilterUseCase: GetHistoriesByFilterUseCase,
        private readonly deactivateHistoryByIdUseCase: DeactivateHistoryByIdUseCase,
        private readonly deactivateHistoriesByUserIdUseCase: DeactivateHistoriesByUserIdUseCase,
    ) {}

    @UseGuards(JwtAuthGuard)
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
    @ApiUnauthorizedResponse({
        description: 'Unauthorized - invalid or missing JWT',
        type: ErrorEntity,
    })
    async generateHistory(
        @Body() body: GenerateHistoryRequestDTO,
        @CurrentUser() user: AuthenticatedUser,
        @Res() response: express.Response,
    ) {
        const result = await this.generateHistoryUseCase.execute({
            userId: user.userId,
            ...body,
        });

        if (result.isFailure) {
            const error = result.error;
            response.status(ErrorCodeMapper.toHttpStatusCode(error.code)).json({ ...error });
            return;
        }

        response.status(201).json({ history: result.Value });
    }

    @UseGuards(JwtAuthGuard)
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
    @ApiUnauthorizedResponse({
        description: 'Unauthorized - invalid or missing JWT',
        type: ErrorEntity,
    })
    async getHistoriesByFilter(
        @Query() filter: GetHistoriesByFilterRequestDTO,
        @CurrentUser() user: AuthenticatedUser,
        @Res() response: express.Response,
    ) {
        const result = await this.getHistoriesByFilterUseCase.execute({
            userId: user.userId,
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

    @UseGuards(JwtAuthGuard)
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
    @ApiUnauthorizedResponse({
        description: 'Unauthorized - invalid or missing JWT',
        type: ErrorEntity,
    })
    @ApiInternalServerErrorResponse({
        description: 'Unhandled server error',
        type: ErrorEntity,
    })
    async deactivateHistoryById(
        @Param() params: DeactivateHistoryByIdRequestDTO,
        @CurrentUser() user: AuthenticatedUser,
        @Res() response: express.Response,
    ) {
        const result = await this.deactivateHistoryByIdUseCase.execute(params.id, user.userId);

        if (result.isFailure) {
            const error = result.error;
            response.status(ErrorCodeMapper.toHttpStatusCode(error.code)).json({ ...error });
            return;
        }

        response.status(200).json({ message: 'History deactivated successfully' });
    }

    @UseGuards(JwtAuthGuard)
    @Patch('deactivate-by-user')
    @ApiOperation({ summary: 'Deactivate histories by user ID' })
    @ApiOkResponse({
        description: 'Histories deactivated successfully',
        type: ErrorEntity,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized - invalid or missing JWT',
        type: ErrorEntity,
    })
    @ApiInternalServerErrorResponse({
        description: 'Unhandled server error',
        type: ErrorEntity,
    })
    async deactivateHistoriesByUserId(
        @CurrentUser() user: AuthenticatedUser,
        @Res() response: express.Response,
    ) {
        const userId = user.userId;
        const result = await this.deactivateHistoriesByUserIdUseCase.execute(userId);

        if (result.isFailure) {
            const error = result.error;
            response.status(ErrorCodeMapper.toHttpStatusCode(error.code)).json({ ...error });
            return;
        }

        response.status(200).json({ message: 'Histories deactivated successfully' });
    }
}
