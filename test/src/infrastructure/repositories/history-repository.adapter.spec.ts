import { Test, type TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HistoryRepositoryAdapter } from '@infrastructure/repositories/history-repository.adapter';
import { History } from '@infrastructure/database/history.model';
import { HistoryEntity } from '@domain/histories/history.entity';
import { ErrorCodes } from '@domain/abstractions/error.entity';
import { Types } from 'mongoose';

type HistoryModelInstance = {
    save: jest.Mock<Promise<unknown>, []>;
};

describe('HistoryRepositoryAdapter', () => {
    describe('saveHistory', () => {
        it('should save a history successfully', async () => {
            // Arrange
            const mockHistoryModel = jest.fn().mockImplementation(function (
                this: HistoryModelInstance,
                data: Record<string, unknown>,
            ) {
                this.save = jest.fn<Promise<unknown>, []>().mockResolvedValue({
                    ...data,
                    _id: new Types.ObjectId(),
                });
                return this;
            });

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    HistoryRepositoryAdapter,
                    {
                        provide: getModelToken(History.name),
                        useValue: mockHistoryModel,
                    },
                ],
            }).compile();

            const adapter = module.get<HistoryRepositoryAdapter>(HistoryRepositoryAdapter);

            const entity = HistoryEntity.create({
                userId: 'user123',
                content: 'Test content',
            });

            // Act
            const result = await adapter.saveHistory(entity);

            // Assert
            expect(result.isSuccess).toBe(true);
        });
    });

    describe('getHistoriesByFilter', () => {
        it('should retrieve histories by filter', async () => {
            // Arrange
            const mockHistories = [
                {
                    _id: new Types.ObjectId(),
                    userId: 'user123',
                    content: 'Content 1',
                    isActive: true,
                    generateAt: new Date(),
                },
            ];

            const mockHistoryModel = {
                find: jest.fn().mockReturnValue({
                    lean: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(mockHistories),
                    }),
                }),
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    HistoryRepositoryAdapter,
                    {
                        provide: getModelToken(History.name),
                        useValue: mockHistoryModel,
                    },
                ],
            }).compile();

            const adapter = module.get<HistoryRepositoryAdapter>(HistoryRepositoryAdapter);

            // Act
            const result = await adapter.getHistoriesByFilter({ userId: 'user123' });

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.Value).toHaveLength(1);
        });

        it('should return empty array when no histories found', async () => {
            // Arrange
            const mockHistoryModel = {
                find: jest.fn().mockReturnValue({
                    lean: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue([]),
                    }),
                }),
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    HistoryRepositoryAdapter,
                    {
                        provide: getModelToken(History.name),
                        useValue: mockHistoryModel,
                    },
                ],
            }).compile();

            const adapter = module.get<HistoryRepositoryAdapter>(HistoryRepositoryAdapter);

            // Act
            const result = await adapter.getHistoriesByFilter({ userId: 'user123' });

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(result.Value).toHaveLength(0);
        });

        it('should return failure on database error', async () => {
            // Arrange
            const mockHistoryModel = {
                find: jest.fn().mockImplementation(() => {
                    throw new Error('Database error');
                }),
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    HistoryRepositoryAdapter,
                    {
                        provide: getModelToken(History.name),
                        useValue: mockHistoryModel,
                    },
                ],
            }).compile();

            const adapter = module.get<HistoryRepositoryAdapter>(HistoryRepositoryAdapter);

            // Act
            const result = await adapter.getHistoriesByFilter({ userId: 'user123' });

            // Assert
            expect(result.isSuccess).toBe(false);
            expect(result.error.code).toBe(ErrorCodes.DatabaseError);
        });
    });

    describe('deactivateByUserId', () => {
        it('should deactivate all active histories by userId', async () => {
            // Arrange
            const mockHistoryModel = {
                updateMany: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue({ modifiedCount: 5 }),
                }),
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    HistoryRepositoryAdapter,
                    {
                        provide: getModelToken(History.name),
                        useValue: mockHistoryModel,
                    },
                ],
            }).compile();

            const adapter = module.get<HistoryRepositoryAdapter>(HistoryRepositoryAdapter);

            // Act
            const result = await adapter.deactivateByUserId('user123');

            // Assert
            expect(result.isSuccess).toBe(true);
            expect(mockHistoryModel.updateMany).toHaveBeenCalledWith(
                { userId: 'user123', isActive: true },
                { isActive: false },
            );
        });

        it('should return failure on database error', async () => {
            // Arrange
            const mockHistoryModel = {
                updateMany: jest.fn().mockImplementation(() => {
                    throw new Error('Database error');
                }),
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    HistoryRepositoryAdapter,
                    {
                        provide: getModelToken(History.name),
                        useValue: mockHistoryModel,
                    },
                ],
            }).compile();

            const adapter = module.get<HistoryRepositoryAdapter>(HistoryRepositoryAdapter);

            // Act
            const result = await adapter.deactivateByUserId('user123');

            // Assert
            expect(result.isSuccess).toBe(false);
            expect(result.error.code).toBe(ErrorCodes.DatabaseError);
        });
    });

    describe('deactivateById', () => {
        it('should deactivate a history by id and userId', async () => {
            // Arrange
            const id = new Types.ObjectId().toHexString();
            const mockHistoryModel = {
                findOneAndUpdate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue({
                        _id: new Types.ObjectId(),
                        isActive: false,
                    }),
                }),
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    HistoryRepositoryAdapter,
                    {
                        provide: getModelToken(History.name),
                        useValue: mockHistoryModel,
                    },
                ],
            }).compile();

            const adapter = module.get<HistoryRepositoryAdapter>(HistoryRepositoryAdapter);

            // Act
            const result = await adapter.deactivateById(id, 'user123');

            // Assert
            expect(result.isSuccess).toBe(true);
        });

        it('should return not found error when history does not exist', async () => {
            // Arrange
            const id = new Types.ObjectId().toHexString();
            const mockHistoryModel = {
                findOneAndUpdate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(null),
                }),
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    HistoryRepositoryAdapter,
                    {
                        provide: getModelToken(History.name),
                        useValue: mockHistoryModel,
                    },
                ],
            }).compile();

            const adapter = module.get<HistoryRepositoryAdapter>(HistoryRepositoryAdapter);

            // Act
            const result = await adapter.deactivateById(id, 'user123');

            // Assert
            expect(result.isSuccess).toBe(false);
            expect(result.error.code).toBe(ErrorCodes.NotFound);
        });

        it('should return failure on database error', async () => {
            // Arrange
            const id = new Types.ObjectId().toHexString();
            const mockHistoryModel = {
                findOneAndUpdate: jest.fn().mockImplementation(() => {
                    throw new Error('Database error');
                }),
            };

            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    HistoryRepositoryAdapter,
                    {
                        provide: getModelToken(History.name),
                        useValue: mockHistoryModel,
                    },
                ],
            }).compile();

            const adapter = module.get<HistoryRepositoryAdapter>(HistoryRepositoryAdapter);

            // Act
            const result = await adapter.deactivateById(id, 'user123');

            // Assert
            expect(result.isSuccess).toBe(false);
            expect(result.error.code).toBe(ErrorCodes.DatabaseError);
        });
    });
});
