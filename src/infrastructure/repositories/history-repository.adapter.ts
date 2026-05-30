import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ResultEntity } from 'src/domain/abstractions/result.entity';
import { HistoryEntity } from 'src/domain/histories/history.entity';
import {
    HistoryFilter,
    HistoryRepositoryPort,
} from 'src/domain/histories/ports/history-repository.port';
import { History } from '../database/history.model';
import { Model } from 'mongoose';
import { HistoryRepositoryMapping } from './history-repository.mapping';
import { ErrorEntity } from 'src/domain/abstractions/error.entity';

@Injectable()
export class HistoryRepositoryAdapter implements HistoryRepositoryPort {
    constructor(@InjectModel(History.name) private readonly historyModel: Model<History>) {}

    private readonly logger = new Logger(HistoryRepositoryAdapter.name);

    private logError(baseMessage: string, error: unknown): void {
        this.logger.error(
            baseMessage + (error instanceof Error ? ': ' + error.message : ''),
            error instanceof Error ? error.stack : null,
        );
    }

    async saveHistory(entity: HistoryEntity): Promise<ResultEntity<void>> {
        try {
            const history = new this.historyModel(HistoryRepositoryMapping.toModel(entity));

            await history.save();
            this.logger.log('History saved successfully');
            return ResultEntity.success();
        } catch (error) {
            const baseMessage = 'Failed to save history';

            this.logError(baseMessage, error);
            return ResultEntity.failure(ErrorEntity.DatabaseError(baseMessage));
        }
    }

    async getHistoriesByFilter(filter: HistoryFilter): Promise<ResultEntity<HistoryEntity[]>> {
        try {
            const histories = await this.historyModel
                .find({ ...filter, isActive: true })
                .lean()
                .exec();
            const historyEntities = histories.map((history) =>
                HistoryRepositoryMapping.toEntity(history),
            );
            this.logger.log(`Retrieved ${historyEntities.length} histories successfully`);
            return ResultEntity.success(historyEntities);
        } catch (error) {
            const baseMessage = 'Failed to retrieve histories';

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
                `Deactivated ${update.modifiedCount} histories for userId: ${userId} successfully`,
            );

            return ResultEntity.success();
        } catch (error) {
            const baseMessage = `Failed to deactivate histories for userId: ${userId}`;

            this.logError(baseMessage, error);
            return ResultEntity.failure(ErrorEntity.DatabaseError(baseMessage));
        }
    }

    async deactivateById(id: string): Promise<ResultEntity<void>> {
        try {
            const update = await this.historyModel
                .findOneAndUpdate({ _id: id, isActive: true }, { isActive: false })
                .exec();

            if (!update) {
                this.logger.warn(`History with id: ${id} not found`);
                return ResultEntity.failure(
                    ErrorEntity.NotFound(`History with id: ${id} not found`),
                );
            }

            this.logger.log(`Deactivated history with id: ${id} successfully`);
            return ResultEntity.success();
        } catch (error) {
            const baseMessage = `Failed to deactivate history with id: ${id}`;

            this.logError(baseMessage, error);
            return ResultEntity.failure(ErrorEntity.DatabaseError(baseMessage));
        }
    }
}
