import { HistorySchema } from '@infrastructure/database/history.model';

type SchemaPathWithDefault = {
    defaultValue?: unknown;
};

const getPathDefaultValue = (path: unknown): unknown =>
    (path as SchemaPathWithDefault).defaultValue;

describe('History Model', () => {
    describe('HistorySchema', () => {
        it('should be defined', () => {
            expect(HistorySchema).toBeDefined();
        });

        it('requires userId for owned histories and allows it to be absent for anonymous histories', () => {
            const paths = HistorySchema.paths;
            expect(paths.userId).toBeDefined();
            expect(paths.userId.options.required).toEqual(expect.any(Function));
        });

        it('should have content field as required', () => {
            const paths = HistorySchema.paths;
            expect(paths.content).toBeDefined();
            expect(paths.content.isRequired).toBe(true);
        });

        it('should have type field as required', () => {
            const paths = HistorySchema.paths;
            expect(paths.type).toBeDefined();
            expect(paths.type.isRequired).toBe(true);
        });

        it('should have isActive field with default true', () => {
            const paths = HistorySchema.paths;
            expect(paths.isActive).toBeDefined();
            expect(getPathDefaultValue(paths.isActive)).toBe(true);
        });

        it('should have generateAt field with default Date.now', () => {
            const paths = HistorySchema.paths;
            expect(paths.generateAt).toBeDefined();
            expect(typeof getPathDefaultValue(paths.generateAt)).toBe('function');
        });

        it('should have optional fields: date, theme, character', () => {
            const paths = HistorySchema.paths;
            expect(paths.date).toBeDefined();
            expect(paths.theme).toBeDefined();
            expect(paths.character).toBeDefined();
            expect(paths.date.isRequired).toBe(false);
            expect(paths.theme.isRequired).toBe(false);
            expect(paths.character.isRequired).toBe(false);
        });

        it('indexes active histories by owner and deterministic list order', () => {
            expect(HistorySchema.indexes()).toContainEqual([
                { userId: 1, isActive: 1, generateAt: -1, _id: -1 },
                {},
            ]);
        });
    });
});
