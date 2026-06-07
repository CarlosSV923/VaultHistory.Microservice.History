import { HistoryController } from '@api/controllers/history.controller';
import type {
    DeactivateHistoriesByUserIdUseCase,
    DeactivateHistoryByIdUseCase,
    GenerateHistoryUseCase,
    GetHistoriesByFilterUseCase,
} from '@application/use-cases';
import { ErrorEntity } from '@domain/abstractions/error.entity';
import { ResultEntity } from '@domain/abstractions/result.entity';
import { HistoryEntity } from '@domain/histories/history.entity';
import { type Response } from 'express';

type ResponseBody = Record<string, unknown>;

type MockResponse = {
    status: jest.Mock<MockResponse, [number]>;
    json: jest.Mock<MockResponse, [ResponseBody]>;
};

const createResponse = (): MockResponse => {
    const response = {
        status: jest.fn<MockResponse, [number]>(),
        json: jest.fn<MockResponse, [ResponseBody]>(),
    };
    response.status.mockReturnValue(response);
    response.json.mockReturnValue(response);
    return response;
};

const asExpressResponse = (response: MockResponse): Response => response as unknown as Response;

describe('HistoryController', () => {
    let controller: HistoryController;
    let generateHistoryUseCase: jest.Mocked<GenerateHistoryUseCase>;
    let getHistoriesByFilterUseCase: jest.Mocked<GetHistoriesByFilterUseCase>;
    let deactivateHistoryByIdUseCase: jest.Mocked<DeactivateHistoryByIdUseCase>;
    let deactivateHistoriesByUserIdUseCase: jest.Mocked<DeactivateHistoriesByUserIdUseCase>;

    const user = {
        userId: 'user123',
        email: 'user@example.com',
        fullName: 'Test User',
    };

    beforeEach(() => {
        generateHistoryUseCase = {
            execute: jest.fn(),
        } as unknown as jest.Mocked<GenerateHistoryUseCase>;
        getHistoriesByFilterUseCase = {
            execute: jest.fn(),
        } as unknown as jest.Mocked<GetHistoriesByFilterUseCase>;
        deactivateHistoryByIdUseCase = {
            execute: jest.fn(),
        } as unknown as jest.Mocked<DeactivateHistoryByIdUseCase>;
        deactivateHistoriesByUserIdUseCase = {
            execute: jest.fn(),
        } as unknown as jest.Mocked<DeactivateHistoriesByUserIdUseCase>;

        controller = new HistoryController(
            generateHistoryUseCase,
            getHistoriesByFilterUseCase,
            deactivateHistoryByIdUseCase,
            deactivateHistoriesByUserIdUseCase,
        );
    });

    describe('generateHistory', () => {
        it('should generate history and return created response', async () => {
            const response = createResponse();
            const body = {
                date: '2024-01-01',
                theme: 'Adventure',
                character: 'Hero',
            };

            generateHistoryUseCase.execute.mockResolvedValue(ResultEntity.success('Generated'));

            await controller.generateHistory(body, user, asExpressResponse(response));

            expect(generateHistoryUseCase.execute.mock.calls).toEqual([
                [
                    {
                        userId: 'user123',
                        ...body,
                    },
                ],
            ]);
            expect(response.status.mock.calls).toEqual([[201]]);
            expect(response.json.mock.calls).toEqual([[{ history: 'Generated' }]]);
        });

        it('should map use case failure to http error response', async () => {
            const response = createResponse();
            const error = ErrorEntity.ValidationError('Invalid request');

            generateHistoryUseCase.execute.mockResolvedValue(ResultEntity.failure(error));

            await controller.generateHistory({}, user, asExpressResponse(response));

            expect(response.status.mock.calls).toEqual([[400]]);
            expect(response.json.mock.calls).toEqual([[{ ...error }]]);
        });
    });

    describe('getHistoriesByFilter', () => {
        it('should return histories mapped to response DTO shape', async () => {
            const response = createResponse();
            const generateAt = new Date('2024-01-01T00:00:00.000Z');
            const history = HistoryEntity.restore({
                id: 'history123',
                userId: 'user123',
                content: 'Content',
                date: '2024-01-01',
                theme: 'Adventure',
                character: 'Hero',
                isActive: true,
                generateAt,
            });

            getHistoriesByFilterUseCase.execute.mockResolvedValue(ResultEntity.success([history]));

            await controller.getHistoriesByFilter(
                { theme: 'Adventure' },
                user,
                asExpressResponse(response),
            );

            expect(getHistoriesByFilterUseCase.execute.mock.calls).toEqual([
                [
                    {
                        userId: 'user123',
                        theme: 'Adventure',
                    },
                ],
            ]);
            expect(response.status.mock.calls).toEqual([[200]]);
            expect(response.json.mock.calls).toEqual([
                [
                    {
                        histories: [
                            {
                                id: 'history123',
                                content: 'Content',
                                date: '2024-01-01',
                                theme: 'Adventure',
                                character: 'Hero',
                                generateAt,
                            },
                        ],
                    },
                ],
            ]);
        });

        it('should map list failure to http error response', async () => {
            const response = createResponse();
            const error = ErrorEntity.DatabaseError('Database failed');

            getHistoriesByFilterUseCase.execute.mockResolvedValue(ResultEntity.failure(error));

            await controller.getHistoriesByFilter({}, user, asExpressResponse(response));

            expect(response.status.mock.calls).toEqual([[500]]);
            expect(response.json.mock.calls).toEqual([[{ ...error }]]);
        });
    });

    describe('deactivateHistoryById', () => {
        it('should deactivate history by id', async () => {
            const response = createResponse();

            deactivateHistoryByIdUseCase.execute.mockResolvedValue(ResultEntity.success());

            await controller.deactivateHistoryById(
                { id: 'history123' },
                user,
                asExpressResponse(response),
            );

            expect(deactivateHistoryByIdUseCase.execute.mock.calls).toEqual([
                ['history123', 'user123'],
            ]);
            expect(response.status.mock.calls).toEqual([[200]]);
            expect(response.json.mock.calls).toEqual([
                [{ message: 'History deactivated successfully' }],
            ]);
        });

        it('should map deactivate by id failure to http error response', async () => {
            const response = createResponse();
            const error = ErrorEntity.NotFound('History not found');

            deactivateHistoryByIdUseCase.execute.mockResolvedValue(ResultEntity.failure(error));

            await controller.deactivateHistoryById(
                { id: 'history123' },
                user,
                asExpressResponse(response),
            );

            expect(response.status.mock.calls).toEqual([[404]]);
            expect(response.json.mock.calls).toEqual([[{ ...error }]]);
        });
    });

    describe('deactivateHistoriesByUserId', () => {
        it('should deactivate histories by current user id', async () => {
            const response = createResponse();

            deactivateHistoriesByUserIdUseCase.execute.mockResolvedValue(ResultEntity.success());

            await controller.deactivateHistoriesByUserId(user, asExpressResponse(response));

            expect(deactivateHistoriesByUserIdUseCase.execute.mock.calls).toEqual([['user123']]);
            expect(response.status.mock.calls).toEqual([[200]]);
            expect(response.json.mock.calls).toEqual([
                [{ message: 'Histories deactivated successfully' }],
            ]);
        });

        it('should map deactivate by user failure to http error response', async () => {
            const response = createResponse();
            const error = ErrorEntity.DatabaseError('Database failed');

            deactivateHistoriesByUserIdUseCase.execute.mockResolvedValue(
                ResultEntity.failure(error),
            );

            await controller.deactivateHistoriesByUserId(user, asExpressResponse(response));

            expect(response.status.mock.calls).toEqual([[500]]);
            expect(response.json.mock.calls).toEqual([[{ ...error }]]);
        });
    });
});
