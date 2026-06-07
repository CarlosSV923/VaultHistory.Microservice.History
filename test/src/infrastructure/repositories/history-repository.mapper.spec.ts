import { Types } from 'mongoose';
import { HistoryRepositoryMapper } from '@infrastructure/repositories/history-repository.mapper';
import { HistoryEntity } from '@domain/histories/history.entity';

describe('HistoryRepositoryMapper', () => {
    describe('toEntity', () => {
        it('should convert a history model to a history entity', () => {
            // Arrange
            const historyId = new Types.ObjectId();
            const historyModel = {
                _id: historyId,
                userId: 'user123',
                content: 'Test content',
                date: '2024-01-01',
                theme: 'Adventure',
                character: 'Hero',
                isActive: true,
                generateAt: new Date('2024-01-01'),
            };

            // Act
            const entity = HistoryRepositoryMapper.toEntity(historyModel);

            // Assert
            expect(entity).toBeInstanceOf(HistoryEntity);
            expect(entity.id).toBe(historyId.toHexString());
            expect(entity.userId).toBe(historyModel.userId);
            expect(entity.content).toBe(historyModel.content);
            expect(entity.date).toBe(historyModel.date);
            expect(entity.theme).toBe(historyModel.theme);
            expect(entity.character).toBe(historyModel.character);
            expect(entity.isActive).toBe(historyModel.isActive);
            expect(entity.generateAt).toEqual(historyModel.generateAt);
        });

        it('should handle optional fields when they are undefined', () => {
            // Arrange
            const historyId = new Types.ObjectId();
            const historyModel = {
                _id: historyId,
                userId: 'user123',
                content: 'Test content',
                date: undefined,
                theme: undefined,
                character: undefined,
                isActive: true,
                generateAt: new Date(),
            };

            // Act
            const entity = HistoryRepositoryMapper.toEntity(historyModel);

            // Assert
            expect(entity).toBeInstanceOf(HistoryEntity);
            expect(entity.id).toBe(historyId.toHexString());
            expect(entity.date).toBeUndefined();
            expect(entity.theme).toBeUndefined();
            expect(entity.character).toBeUndefined();
        });
    });

    describe('toModel', () => {
        it('should convert a history entity to a history model', () => {
            // Arrange
            const entity = HistoryEntity.create({
                userId: 'user123',
                content: 'Test content',
                date: '2024-01-01',
                theme: 'Adventure',
                character: 'Hero',
            });

            // Act
            const model = HistoryRepositoryMapper.toModel(entity);

            // Assert
            expect(model).toBeDefined();
            expect(model.userId).toBe(entity.userId);
            expect(model.content).toBe(entity.content);
            expect(model.date).toBe(entity.date);
            expect(model.theme).toBe(entity.theme);
            expect(model.character).toBe(entity.character);
            expect(model.isActive).toBe(true);
            expect(model.generateAt).toEqual(entity.generateAt);
        });

        it('should handle entities without optional fields', () => {
            // Arrange
            const entity = HistoryEntity.create({
                userId: 'user123',
                content: 'Test content',
            });

            // Act
            const model = HistoryRepositoryMapper.toModel(entity);

            // Assert
            expect(model).toBeDefined();
            expect(model.userId).toBe(entity.userId);
            expect(model.content).toBe(entity.content);
            expect(model.date).toBeUndefined();
            expect(model.theme).toBeUndefined();
            expect(model.character).toBeUndefined();
        });
    });
});
