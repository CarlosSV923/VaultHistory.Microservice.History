import { type ResultEntity } from '../../abstractions/result.entity';
import { type HistoryType } from '../history.type.enum';

export interface GenerateHistoryParams {
    userId: string;
    type: HistoryType;
    date?: string;
    theme?: string;
    character?: string;
}

export interface AIServicePort {
    generateContent(data: GenerateHistoryParams): Promise<ResultEntity<string>>;
}

export const AIServicePortToken = Symbol('AIServicePort');
