import { Body, Controller, Get, Post, Query, Res, Patch, Param, Req, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import {
    GenerateHistoryUseCase,
    GenerateAnonymousHistoryUseCase,
    DeactivateHistoriesByUserIdUseCase,
    DeactivateHistoryByIdUseCase,
    GetHistoriesByFilterUseCase,
    GetAnonymousHistoriesUseCase,
} from '@application/use-cases';
import {
    GenerateSubHistoryRequestDTO,
    GenerateQueryHistoryRequestDTO,
    GenerateHistoryResponseDTO,
    GenerateAnonymousHistoryRequestDTO,
    GenerateAnonymousHistoryResponseDTO,
    GetHistoriesByFilterRequestDTO,
    GetHistoriesByFilterResponseDTO,
    GetAnonymousHistoriesRequestDTO,
} from '../dtos';
import { ErrorCodeMapper } from '@api/utils/error-code.mapper';
import {
    DeactivateHistoryByIdRequestDTO,
    DeactivateHistoryByIdResponseDTO,
} from '@api/dtos/deactivate-history-by-id.dto';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiUnauthorizedResponse,
    ApiHeader,
    ApiServiceUnavailableResponse,
    ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { ErrorEntity } from '@domain/abstractions/error.entity';
import { JwtAuthGuard } from '@api/auth/jwt-auth.guard';
import { JobTokenAuthGuard } from '@api/auth/job-token-auth.guard';
import { FrontendTokenAuthGuard } from '@api/auth/frontend-token-auth.guard';
import type { AuthenticatedUser } from '@api/auth/authenticated-user';
import { CurrentUser } from '@api/auth/current-user.decorator';
import { DeactivateHistoriesByUserIdResponseDTO } from '@api/dtos/deactivate-histories-by-user.dto';
import { HistoryType } from '@domain/histories/history.type.enum';

@ApiBearerAuth()
@Controller({ path: 'history', version: '1' })
export class HistoryController {
    constructor(
        private readonly generateHistoryUseCase: GenerateHistoryUseCase,
        private readonly getHistoriesByFilterUseCase: GetHistoriesByFilterUseCase,
        private readonly deactivateHistoryByIdUseCase: DeactivateHistoryByIdUseCase,
        private readonly deactivateHistoriesByUserIdUseCase: DeactivateHistoriesByUserIdUseCase,
        private readonly generateAnonymousHistoryUseCase: GenerateAnonymousHistoryUseCase,
        private readonly getAnonymousHistoriesUseCase: GetAnonymousHistoriesUseCase,
    ) {}

    @UseGuards(FrontendTokenAuthGuard)
    @Post('generate/anonymous')
    @ApiOperation({ summary: 'Generate an anonymous history subject to a daily IP quota' })
    @ApiHeader({
        name: 'Authorization',
        required: true,
        description: 'Fixed frontend token configured through AUTH_TOKEN_FORNT',
    })
    @ApiCreatedResponse({
        description: 'Anonymous history generated successfully',
        type: GenerateAnonymousHistoryResponseDTO,
    })
    @ApiBadRequestResponse({ description: 'Invalid anonymous generation payload', type: ErrorEntity })
    @ApiUnauthorizedResponse({ description: 'Unauthorized - invalid or missing frontend token', type: ErrorEntity })
    @ApiTooManyRequestsResponse({ description: 'Anonymous daily quota exceeded', type: ErrorEntity })
    @ApiServiceUnavailableResponse({ description: 'Anonymous generation unavailable', type: ErrorEntity })
    async generateAnonymousHistory(
        @Body() body: GenerateAnonymousHistoryRequestDTO,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const result = await this.generateAnonymousHistoryUseCase.execute({ ...body, ip: request.ip ?? '' });

        if (!result.isSuccess) {
            const status = ErrorCodeMapper.toHttpStatusCode(result.error.code);
            if (status === 429 && result.usage) {
                const retryAfter = Math.max(1, Math.ceil((Date.parse(result.usage.resetAt) - Date.now()) / 1000));
                response.setHeader('Retry-After', retryAfter.toString());
            }
            response.status(status).json({ ...result.error, ...(result.usage ? { usage: result.usage } : {}) });
            return;
        }

        response.status(201).json({ history: result.history, usage: result.usage });
    }

    @UseGuards(FrontendTokenAuthGuard)
    @Get('list/anonymous')
    @ApiOperation({ summary: 'Get anonymous histories for the caller IP resolved by the trusted proxy' })
    @ApiHeader({
        name: 'Authorization',
        required: true,
        description: 'Fixed frontend token configured through AUTH_TOKEN_FORNT',
    })
    @ApiOkResponse({ description: 'Anonymous histories found', type: GetHistoriesByFilterResponseDTO })
    @ApiBadRequestResponse({ description: 'Invalid pagination parameters', type: ErrorEntity })
    @ApiUnauthorizedResponse({ description: 'Unauthorized - invalid or missing frontend token', type: ErrorEntity })
    @ApiInternalServerErrorResponse({ description: 'Unhandled server error', type: ErrorEntity })
    async getAnonymousHistories(
        @Query() filter: GetAnonymousHistoriesRequestDTO,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const { page = 1, pageSize = 20 } = filter;
        const result = await this.getAnonymousHistoriesUseCase.execute({ ip: request.ip ?? '', page, pageSize });

        if (result.isFailure) {
            const error = result.error;
            response.status(ErrorCodeMapper.toHttpStatusCode(error.code)).json({ ...error });
            return;
        }

        response.status(200).json({
            histories: result.Value.histories.map((history) => ({
                id: history.id,
                content: history.content,
                type: history.type,
                date: history.date,
                theme: history.theme,
                character: history.character,
                generateAt: history.generateAt,
            })),
            meta: {
                page,
                pageSize,
                total: result.Value.total,
                totalPages: Math.ceil(result.Value.total / pageSize),
            },
        });
    }

    @UseGuards(JobTokenAuthGuard)
    @Post('generate/subscription')
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
        description: 'Unauthorized - invalid or missing job token',
        type: ErrorEntity,
    })
    async generateSubHistory(
        @Body() body: GenerateSubHistoryRequestDTO,
        @Res() response: Response,
    ) {
        const { userId, date, theme, character, idempotencyKey } = body;
        const result = await this.generateHistoryUseCase.execute({
            userId,
            type: HistoryType.SUBSCRIPTION,
            ...(date !== undefined ? { date } : {}),
            ...(theme !== undefined ? { theme } : {}),
            ...(character !== undefined ? { character } : {}),
            ...(idempotencyKey !== undefined ? { idempotencyKey } : {}),
        });

        if (result.isFailure) {
            const error = result.error;
            response.status(ErrorCodeMapper.toHttpStatusCode(error.code)).json({ ...error });
            return;
        }

        response.status(201).json({ history: result.Value });
    }

    @UseGuards(JwtAuthGuard)
    @Post('generate/query')
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
    async generateQueryHistory(
        @Body() body: GenerateQueryHistoryRequestDTO,
        @CurrentUser() user: AuthenticatedUser,
        @Res() response: Response,
    ) {
        const { date, theme, character } = body;
        const result = await this.generateHistoryUseCase.execute({
            userId: user.userId,
            type: HistoryType.QUERY,
            ...(date !== undefined ? { date } : {}),
            ...(theme !== undefined ? { theme } : {}),
            ...(character !== undefined ? { character } : {}),
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
    @ApiBadRequestResponse({
        description: 'Invalid filters or pagination parameters',
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
    async getHistoriesByFilter(
        @Query() filter: GetHistoriesByFilterRequestDTO,
        @CurrentUser() user: AuthenticatedUser,
        @Res() response: Response,
    ) {
        const { date, theme, character, type, page = 1, pageSize = 20 } = filter;
        const result = await this.getHistoriesByFilterUseCase.execute({
            userId: user.userId,
            ...(date !== undefined ? { date } : {}),
            ...(theme !== undefined ? { theme } : {}),
            ...(character !== undefined ? { character } : {}),
            ...(type !== undefined ? { type } : {}),
            page,
            pageSize,
        });

        if (result.isFailure) {
            const error = result.error;
            response.status(ErrorCodeMapper.toHttpStatusCode(error.code)).json({ ...error });
            return;
        }

        response.status(200).json({
            histories: result.Value.histories.map((history) => ({
                id: history.id,
                content: history.content,
                type: history.type,
                date: history.date,
                theme: history.theme,
                character: history.character,
                generateAt: history.generateAt,
            })),
            meta: {
                page,
                pageSize,
                total: result.Value.total,
                totalPages: Math.ceil(result.Value.total / pageSize),
            },
        });
    }

    @UseGuards(JwtAuthGuard)
    @Patch('deactivate-by-id/:id')
    @ApiOperation({ summary: 'Deactivate a history by its ID' })
    @ApiOkResponse({
        description: 'History deactivated successfully',
        type: DeactivateHistoryByIdResponseDTO,
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
        @Res() response: Response,
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
        type: DeactivateHistoriesByUserIdResponseDTO,
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
        @Res() response: Response,
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
