import { Inject, Injectable } from '@nestjs/common';
import { ErrorCodes, ErrorEntity } from '@domain/abstractions/error.entity';
import { HistoryType } from '@domain/histories/history.type.enum';
import {
    AnonymousDailyUsageRepositoryPortToken,
    type AnonymousDailyUsageRepositoryPort,
} from '@domain/histories/ports/anonymous-daily-usage-repository.port';
import { AnonymousGenerationConfig } from '../anonymous-generation.config';
import {
    AnonymousGenerationClockToken,
    type AnonymousGenerationClock,
} from '../anonymous-generation.clock';
import { normalizeAnonymousIp } from '../anonymous-ip.normalizer';
import { GenerateHistoryUseCase } from './generate-history.use-case';

export type AnonymousUsage = {
    limit: number;
    remaining: number;
    resetAt: string;
};

export type GenerateAnonymousHistoryResult =
    | { isSuccess: true; history: string; usage: AnonymousUsage }
    | { isSuccess: false; error: ErrorEntity; usage?: AnonymousUsage };

export type GenerateAnonymousHistoryParams = {
    ip: string;
    date?: string;
    theme?: string;
    character?: string;
};

@Injectable()
export class GenerateAnonymousHistoryUseCase {
    constructor(
        private readonly config: AnonymousGenerationConfig,
        private readonly generateHistoryUseCase: GenerateHistoryUseCase,
        @Inject(AnonymousDailyUsageRepositoryPortToken)
        private readonly usageRepository: AnonymousDailyUsageRepositoryPort,
        @Inject(AnonymousGenerationClockToken)
        private readonly clock: AnonymousGenerationClock,
    ) {}

    async execute(params: GenerateAnonymousHistoryParams): Promise<GenerateAnonymousHistoryResult> {
        if (this.config.dailyLimit === 0) {
            return { isSuccess: false, error: ErrorEntity.AnonymousGenerationDisabled() };
        }

        const normalizedIp = normalizeAnonymousIp(params.ip);
        if (normalizedIp.isFailure) return { isSuccess: false, error: normalizedIp.error };

        const now = this.clock.now();
        const day = now.toISOString().slice(0, 10);
        const resetAt = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + 1,
        )).toISOString();
        const consumed = await this.usageRepository.consume(normalizedIp.Value, day, this.config.dailyLimit);
        if (consumed.isFailure) {
            return { isSuccess: false, error: ErrorEntity.AnonymousUsageUnavailable() };
        }

        const exhaustedUsage: AnonymousUsage = {
            limit: this.config.dailyLimit,
            remaining: 0,
            resetAt,
        };
        if (!consumed.Value.allowed) {
            return {
                isSuccess: false,
                error: ErrorEntity.AnonymousDailyLimitExceeded(),
                usage: exhaustedUsage,
            };
        }

        const usage: AnonymousUsage = {
            limit: this.config.dailyLimit,
            remaining: Math.max(0, this.config.dailyLimit - consumed.Value.used),
            resetAt,
        };
        const generated = await this.generateHistoryUseCase.execute({
            type: HistoryType.ANONYMOUS,
            anonymousVisitorKey: normalizedIp.Value,
            ...(params.date !== undefined ? { date: params.date } : {}),
            ...(params.theme !== undefined ? { theme: params.theme } : {}),
            ...(params.character !== undefined ? { character: params.character } : {}),
        });
        if (generated.isSuccess) {
            return { isSuccess: true, history: generated.Value, usage };
        }

        return {
            isSuccess: false,
            error:
                generated.error.code === ErrorCodes.DatabaseError
                    ? ErrorEntity.AnonymousHistoryPersistenceFailed()
                    : ErrorEntity.AnonymousGenerationUnavailable(),
            usage,
        };
    }
}
