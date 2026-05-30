export class HistoryEntity {
    constructor(
        public id: string | null,
        public userId: string,
        public date: string | null,
        public theme: string | null,
        public content: string,
        public character: string | null,
        public isActive: boolean = true,
        public generateAt: Date = new Date(),
    ) {}
}
