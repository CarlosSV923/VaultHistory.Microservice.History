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
            content: historyModel.content,
            date: historyModel.date,
            theme: historyModel.theme,
            character: historyModel.character,
            isActive: historyModel.isActive,
            generateAt: historyModel.generateAt,
        });
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
