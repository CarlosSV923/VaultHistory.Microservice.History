import { type ResultEntity } from '../../abstractions/result.entity';

export interface GenerateContentParams {
    userId: string;
    date?: string;
    theme?: string;
    character?: string;
}

export interface AIServicePort {
    generateContent(data: GenerateContentParams): Promise<ResultEntity<string>>;
}

export const AIServicePortToken = Symbol('AIServicePort');
