import { HistoryEntity } from '@domain/histories/history.entity';

describe('HistoryEntity', () => {
    describe('create', () => {
        it('should create an active history without id', () => {
            const beforeCreation = new Date();

            const history = HistoryEntity.create({
                userId: 'user123',
                content: 'Test content',
                date: '2024-01-01',
                theme: 'Adventure',
                character: 'Hero',
            });

            const afterCreation = new Date();

            expect(history.id).toBeNull();
            expect(history.userId).toBe('user123');
            expect(history.content).toBe('Test content');
            expect(history.date).toBe('2024-01-01');
            expect(history.theme).toBe('Adventure');
            expect(history.character).toBe('Hero');
            expect(history.isActive).toBe(true);
            expect(history.generateAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
            expect(history.generateAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
        });

        it('should create a history with undefined optional fields', () => {
            const history = HistoryEntity.create({
                userId: 'user123',
                content: 'Test content',
            });

            expect(history.id).toBeNull();
            expect(history.date).toBeUndefined();
            expect(history.theme).toBeUndefined();
            expect(history.character).toBeUndefined();
            expect(history.isActive).toBe(true);
        });
    });

    describe('restore', () => {
        it('should restore a history with persisted values', () => {
            const generateAt = new Date('2024-01-01T00:00:00.000Z');

            const history = HistoryEntity.restore({
                id: 'history123',
                userId: 'user123',
                content: 'Persisted content',
                date: '2024-01-01',
                theme: 'Mystery',
                character: 'Detective',
                isActive: false,
                generateAt,
            });

            expect(history.id).toBe('history123');
            expect(history.userId).toBe('user123');
            expect(history.content).toBe('Persisted content');
            expect(history.date).toBe('2024-01-01');
            expect(history.theme).toBe('Mystery');
            expect(history.character).toBe('Detective');
            expect(history.isActive).toBe(false);
            expect(history.generateAt).toBe(generateAt);
        });
    });
});
