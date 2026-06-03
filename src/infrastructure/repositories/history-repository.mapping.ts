import { HistoryEntity } from '@domain/histories/history.entity';
import { type Types } from 'mongoose';
import { type History } from '../database/history.model';

export class HistoryRepositoryMapping {
    static toEntity(
        historyModel: History & {
            _id: Types.ObjectId;
        },
    ): HistoryEntity {
        return new HistoryEntity(
            historyModel._id.toHexString(),
            historyModel.userId,
            historyModel.content,
            historyModel.date,
            historyModel.theme,
            historyModel.character,
            historyModel.isActive,
            historyModel.generateAt,
        );
    }

    static toModel(
        entity: HistoryEntity,
    ): Pick<
        History,
        'userId' | 'content' | 'date' | 'theme' | 'character' | 'isActive' | 'generateAt'
    > {
        return {
            userId: entity.userId,
            content: entity.content,
            date: entity.date,
            theme: entity.theme,
            character: entity.character,
            isActive: entity.isActive,
            generateAt: entity.generateAt,
        };
    }
}
