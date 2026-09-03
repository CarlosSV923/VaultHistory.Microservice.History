import { type ResultEntity } from '../../abstractions/result.entity';
import { type HistoryEntity } from '../history.entity';
import type { HistoryType } from '../history.type.enum';

export interface GetHistoryFilter {
    userId: string;
    date?: string;
    theme?: string;
    character?: string;
    type?: HistoryType;
}

export interface HistoryRepositoryPort {
    saveHistory(entity: HistoryEntity): Promise<ResultEntity<void>>;
    getHistoriesByFilter(filter: GetHistoryFilter): Promise<ResultEntity<HistoryEntity[]>>;
    deactivateByUserId(userId: string): Promise<ResultEntity<void>>;
    deactivateById(id: string, userId: string): Promise<ResultEntity<void>>;
}

export const HistoryRepositoryPortToken = Symbol('HistoryRepositoryPort');
