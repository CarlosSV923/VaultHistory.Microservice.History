import { DeactivateHistoryByIdUseCase } from '@application/use-cases/deactivate-history-by-id.use-case';
import { ErrorEntity } from '@domain/abstractions/error.entity';
import { ResultEntity } from '@domain/abstractions/result.entity';
import { type HistoryRepositoryPort } from '@domain/histories/ports/history-repository.port';

describe('DeactivateHistoryByIdUseCase', () => {
    let useCase: DeactivateHistoryByIdUseCase;
    let mockHistoryRepository: jest.Mocked<HistoryRepositoryPort>;

    beforeEach(() => {
        mockHistoryRepository = {
            saveHistory: jest.fn(),
            getHistoriesByFilter: jest.fn(),
            deactivateByUserId: jest.fn(),
            deactivateById: jest.fn(),
        };

        useCase = new DeactivateHistoryByIdUseCase(mockHistoryRepository);
    });

    it('should deactivate history by id and user id', async () => {
        const expectedResult = ResultEntity.success();

        mockHistoryRepository.deactivateById.mockResolvedValue(expectedResult);

        const result = await useCase.execute('history123', 'user123');

        expect(result).toBe(expectedResult);
        expect(mockHistoryRepository.deactivateById.mock.calls).toEqual([
            ['history123', 'user123'],
        ]);
    });

    it('should return repository failure', async () => {
        const expectedResult = ResultEntity.failure<void>(
            ErrorEntity.NotFound('History was not found'),
        );

        mockHistoryRepository.deactivateById.mockResolvedValue(expectedResult);

        const result = await useCase.execute('history123', 'user123');

        expect(result).toBe(expectedResult);
        expect(result.isFailure).toBe(true);
    });
});
