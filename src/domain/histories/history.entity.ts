import type { HistoryType } from './history.type.enum';

export type CreateHistoryParams = {
    userId?: string;
    anonymousVisitorKey?: string;
    content: string;
    date?: string;
    theme?: string;
    character?: string;
    type: HistoryType;
    idempotencyKey?: string;
};

export type RestoreHistoryParams = {
    id: string;
    userId?: string;
    anonymousVisitorKey?: string;
    content: string;
    date?: string;
    theme?: string;
    character?: string;
    isActive: boolean;
    generateAt: Date;
    type: HistoryType;
    idempotencyKey?: string;
};

export class HistoryEntity {
    private constructor(
        private readonly _id: string | null,
        private readonly _userId: string | undefined,
        private readonly _anonymousVisitorKey: string | undefined,
        private readonly _content: string,
        private readonly _date: string | undefined,
        private readonly _theme: string | undefined,
        private readonly _character: string | undefined,
        private readonly _isActive: boolean,
        private readonly _generateAt: Date,
        private readonly _type: HistoryType,
        private readonly _idempotencyKey: string | undefined,
    ) {}

    static create(params: CreateHistoryParams): HistoryEntity {
        return new HistoryEntity(
            null,
            params.userId,
            params.anonymousVisitorKey,
            params.content,
            params.date,
            params.theme,
            params.character,
            true,
            new Date(),
            params.type,
            params.idempotencyKey,
        );
    }

    static restore(params: RestoreHistoryParams): HistoryEntity {
        return new HistoryEntity(
            params.id,
            params.userId,
            params.anonymousVisitorKey,
            params.content,
            params.date,
            params.theme,
            params.character,
            params.isActive,
            params.generateAt,
            params.type,
            params.idempotencyKey,
        );
    }

    get id(): string | null {
        return this._id;
    }

    get userId(): string | undefined {
        return this._userId;
    }

    get anonymousVisitorKey(): string | undefined {
        return this._anonymousVisitorKey;
    }

    get content(): string {
        return this._content;
    }

    get date(): string | undefined {
        return this._date;
    }

    get theme(): string | undefined {
        return this._theme;
    }

    get character(): string | undefined {
        return this._character;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get generateAt(): Date {
        return this._generateAt;
    }

    get type(): HistoryType {
        return this._type;
    }

    get idempotencyKey(): string | undefined { return this._idempotencyKey; }
}
