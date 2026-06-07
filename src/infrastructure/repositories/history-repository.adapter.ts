import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ResultEntity } from '@domain/abstractions/result.entity';
import { HistoryEntity } from '@domain/histories/history.entity';
import {
    GetHistoryFilter,
    HistoryRepositoryPort,
} from '@domain/histories/ports/history-repository.port';
import { History, HistoryDocument } from '../database/history.model';
import { Model } from 'mongoose';
import { HistoryRepositoryMapper } from './history-repository.mapper';
import { ErrorEntity } from '@domain/abstractions/error.entity';

@Injectable()
export class HistoryRepositoryAdapter implements HistoryRepositoryPort {
    constructor(@InjectModel(History.name) private readonly historyModel: Model<HistoryDocument>) {}

    private readonly logger = new Logger(HistoryRepositoryAdapter.name);

    private logError(baseMessage: string, error: unknown): void {
        this.logger.error(
            baseMessage + (error instanceof Error ? ': ' + error.message : ''),
            error instanceof Error ? error.stack : null,
        );
    }

    async saveHistory(entity: HistoryEntity): Promise<ResultEntity<void>> {
        try {
            const history = new this.historyModel(HistoryRepositoryMapper.toModel(entity));

            const result = await history.save();
            this.logger.log(
                `User ${entity.userId} - History saved successfully - Id: ${result._id.toHexString()}`,
            );
            return ResultEntity.success();
        } catch (error) {
            const baseMessage = `User ${entity.userId} - Failed to save history`;

            this.logError(baseMessage, error);
            return ResultEntity.failure(ErrorEntity.DatabaseError(baseMessage));
        }
    }

    async getHistoriesByFilter(filter: GetHistoryFilter): Promise<ResultEntity<HistoryEntity[]>> {
        try {
            const histories = await this.historyModel
                .find({ ...filter, isActive: true })
                .lean()
                .exec();
            const historyEntities = histories.map((history) =>
                HistoryRepositoryMapper.toEntity(history),
            );
            this.logger.log(`Retrieved ${historyEntities.length} histories successfully`);
            return ResultEntity.success(historyEntities);
        } catch (error) {
            const baseMessage = `User ${filter.userId} - Failed to retrieve histories`;

            this.logError(baseMessage, error);
            return ResultEntity.failure(ErrorEntity.DatabaseError(baseMessage));
        }
    }

    async deactivateByUserId(userId: string): Promise<ResultEntity<void>> {
        try {
            const update = await this.historyModel
                .updateMany({ userId, isActive: true }, { isActive: false })
                .exec();

            this.logger.log(
                `User ${userId} - Deactivated ${update.modifiedCount} histories successfully`,
            );

            return ResultEntity.success();
        } catch (error) {
            const baseMessage = `User ${userId} - Failed to deactivate histories`;

            this.logError(baseMessage, error);
            return ResultEntity.failure(ErrorEntity.DatabaseError(baseMessage));
        }
    }

    async deactivateById(id: string, userId: string): Promise<ResultEntity<void>> {
        try {
            const update = await this.historyModel
                .findOneAndUpdate({ _id: id, userId, isActive: true }, { isActive: false })
                .exec();

            if (!update) {
                this.logger.warn(`User ${userId} - History with id: ${id} not found`);
                return ResultEntity.failure(
                    ErrorEntity.NotFound(`User ${userId} - History with id: ${id} not found`),
                );
            }

            this.logger.log(`User ${userId} - Deactivated history with id: ${id} successfully`);
            return ResultEntity.success();
        } catch (error) {
            const baseMessage = `User ${userId} - Failed to deactivate history with id: ${id}`;

            this.logError(baseMessage, error);
            return ResultEntity.failure(ErrorEntity.DatabaseError(baseMessage));
        }
    }
}
