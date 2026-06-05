import { DeactivateHistoriesByUserIdUseCase } from '@application/use-cases/deactivate-histories-by-user-id.use-case';
import { ErrorEntity } from '@domain/abstractions/error.entity';
import { ResultEntity } from '@domain/abstractions/result.entity';
import { type HistoryRepositoryPort } from '@domain/histories/ports/history-repository.port';

describe('DeactivateHistoriesByUserIdUseCase', () => {
    let useCase: DeactivateHistoriesByUserIdUseCase;
    let mockHistoryRepository: jest.Mocked<HistoryRepositoryPort>;

    beforeEach(() => {
        mockHistoryRepository = {
            saveHistory: jest.fn(),
            getHistoriesByFilter: jest.fn(),
            deactivateByUserId: jest.fn(),
            deactivateById: jest.fn(),
        };

        useCase = new DeactivateHistoriesByUserIdUseCase(mockHistoryRepository);
    });

    it('should deactivate histories by user id', async () => {
        const expectedResult = ResultEntity.success();

        mockHistoryRepository.deactivateByUserId.mockResolvedValue(expectedResult);

        const result = await useCase.execute('user123');

        expect(result).toBe(expectedResult);
        expect(mockHistoryRepository.deactivateByUserId.mock.calls).toEqual([['user123']]);
    });

    it('should return repository failure', async () => {
        const expectedResult = ResultEntity.failure<void>(
            ErrorEntity.DatabaseError('Failed to deactivate histories'),
        );

        mockHistoryRepository.deactivateByUserId.mockResolvedValue(expectedResult);

        const result = await useCase.execute('user123');

        expect(result).toBe(expectedResult);
        expect(result.isFailure).toBe(true);
    });
});
