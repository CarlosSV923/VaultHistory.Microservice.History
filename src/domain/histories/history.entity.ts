export type CreateHistoryParams = {
    userId: string;
    content: string;
    date?: string;
    theme?: string;
    character?: string;
};

export type RestoreHistoryParams = {
    id: string;
    userId: string;
    content: string;
    date?: string;
    theme?: string;
    character?: string;
    isActive: boolean;
    generateAt: Date;
};

export class HistoryEntity {
    private constructor(
        private readonly _id: string | null,
        private readonly _userId: string,
        private readonly _content: string,
        private readonly _date: string | undefined,
        private readonly _theme: string | undefined,
        private readonly _character: string | undefined,
        private readonly _isActive: boolean,
        private readonly _generateAt: Date,
    ) {}

    static create(params: CreateHistoryParams): HistoryEntity {
        return new HistoryEntity(
            null,
            params.userId,
            params.content,
            params.date,
            params.theme,
            params.character,
            true,
            new Date(),
        );
    }

    static restore(params: RestoreHistoryParams): HistoryEntity {
        return new HistoryEntity(
            params.id,
            params.userId,
            params.content,
            params.date,
            params.theme,
            params.character,
            params.isActive,
            params.generateAt,
        );
    }

    get id(): string | null {
        return this._id;
    }

    get userId(): string {
        return this._userId;
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
}
