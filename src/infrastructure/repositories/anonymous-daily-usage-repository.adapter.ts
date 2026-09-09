import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ErrorEntity } from '@domain/abstractions/error.entity';
import { ResultEntity } from '@domain/abstractions/result.entity';
import {
    type AnonymousDailyUsageRepositoryPort,
    type AnonymousUsageConsumption,
} from '@domain/histories/ports/anonymous-daily-usage-repository.port';
import {
    AnonymousDailyUsage,
    type AnonymousDailyUsageDocument,
} from '../database/anonymous-daily-usage.model';
import type { Model } from 'mongoose';

@Injectable()
export class AnonymousDailyUsageRepositoryAdapter
    implements AnonymousDailyUsageRepositoryPort, OnModuleInit
{
    private readonly logger = new Logger(AnonymousDailyUsageRepositoryAdapter.name);

    constructor(
        @InjectModel(AnonymousDailyUsage.name)
        private readonly usageModel: Model<AnonymousDailyUsageDocument>,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.usageModel.init();
    }

    async consume(
        ip: string,
        day: string,
        limit: number,
    ): Promise<ResultEntity<AnonymousUsageConsumption>> {
        try {
            try {
                await this.usageModel.updateOne(
                    { ip, day },
                    { $setOnInsert: { ip, day, used: 0 } },
                    { upsert: true },
                ).exec();
            } catch (error) {
                if (!(typeof error === 'object' && error !== null && 'code' in error && error.code === 11000)) {
                    throw error;
                }
            }

            const usage = await this.usageModel
                .findOneAndUpdate(
                    { ip, day, used: { $lt: limit } },
                    { $inc: { used: 1 } },
                    { returnDocument: 'after' },
                )
                .lean()
                .exec();

            return ResultEntity.success(usage ? { used: usage.used, allowed: true } : { used: limit, allowed: false });
        } catch (error) {
            this.logger.error(
                `Failed to consume anonymous usage for ${ip}`,
                error instanceof Error ? error.stack : undefined,
            );
            return ResultEntity.failure(ErrorEntity.DatabaseError('Failed to consume anonymous usage'));
        }
    }
}
