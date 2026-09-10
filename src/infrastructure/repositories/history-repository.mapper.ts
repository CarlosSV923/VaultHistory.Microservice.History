import { HistoryEntity } from '@domain/histories/history.entity';
import { type Types } from 'mongoose';
import { type History } from '../database/history.model';

export class HistoryRepositoryMapper {
    static toEntity(
        historyModel: History & {
            _id: Types.ObjectId;
        },
    ): HistoryEntity {
        return HistoryEntity.restore({
            id: historyModel._id.toHexString(),
            userId: historyModel.userId,
            anonymousVisitorKey: historyModel.anonymousVisitorKey,
            content: historyModel.content,
            date: historyModel.date,
            theme: historyModel.theme,
            character: historyModel.character,
            isActive: historyModel.isActive,
            generateAt: historyModel.generateAt,
            type: historyModel.type,
            idempotencyKey: historyModel.idempotencyKey,
        });
    }

    static toModel(
        entity: HistoryEntity,
    ): Pick<
        History,
        'userId' | 'anonymousVisitorKey' | 'content' | 'date' | 'theme' | 'character' | 'isActive' | 'generateAt' | 'type' | 'idempotencyKey'
    > {
        return {
            userId: entity.userId,
            anonymousVisitorKey: entity.anonymousVisitorKey,
            content: entity.content,
            date: entity.date,
            theme: entity.theme,
            character: entity.character,
            isActive: entity.isActive,
            generateAt: entity.generateAt,
            type: entity.type,
            idempotencyKey: entity.idempotencyKey,
        };
    }
}
