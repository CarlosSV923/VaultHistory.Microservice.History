export class HistoryEntity {
    constructor(
        public id: string | null,
        public userId: string,
        public content: string,
        public date?: string,
        public theme?: string,
        public character?: string,
        public isActive: boolean = true,
        public generateAt: Date = new Date(),
    ) {}
}
