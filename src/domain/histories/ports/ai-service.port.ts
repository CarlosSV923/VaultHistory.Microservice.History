import { type ResultEntity } from '../../abstractions/result.entity';

type contentData = {
    date?: string;
    theme?: string;
    character?: string;
};

export interface AIServicePort {
    generateContent(data: contentData): Promise<ResultEntity<string>>;
}

export const AIServicePortToken = Symbol('AIServicePort');
