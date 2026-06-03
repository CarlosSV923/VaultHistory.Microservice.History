import { type ResultEntity } from '../../abstractions/result.entity';
import { type HistoryEntity } from '../history.entity';

export interface GetHistoryFilter {
    userId: string;
    date?: string;
    theme?: string;
    character?: string;
}

export interface HistoryRepositoryPort {
    saveHistory(entity: HistoryEntity): Promise<ResultEntity<void>>;
    getHistoriesByFilter(filter: GetHistoryFilter): Promise<ResultEntity<HistoryEntity[]>>;
    deactivateByUserId(userId: string): Promise<ResultEntity<void>>;
    deactivateById(id: string): Promise<ResultEntity<void>>;
}

export const HistoryRepositoryPortToken = Symbol('HistoryRepositoryPort');
