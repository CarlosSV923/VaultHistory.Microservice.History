import { GetHistoriesByFilterUseCase } from '@application/use-cases/get-histories-by-filter.use-case';
import { ErrorEntity } from '@domain/abstractions/error.entity';
import { ResultEntity } from '@domain/abstractions/result.entity';
import { HistoryEntity } from '@domain/histories/history.entity';
import { type HistoryRepositoryPort } from '@domain/histories/ports/history-repository.port';

describe('GetHistoriesByFilterUseCase', () => {
    let useCase: GetHistoriesByFilterUseCase;
    let mockHistoryRepository: jest.Mocked<HistoryRepositoryPort>;

    beforeEach(() => {
        mockHistoryRepository = {
            saveHistory: jest.fn(),
            getHistoriesByFilter: jest.fn(),
            deactivateByUserId: jest.fn(),
            deactivateById: jest.fn(),
        };

        useCase = new GetHistoriesByFilterUseCase(mockHistoryRepository);
    });

    it('should return histories from repository by filter', async () => {
        const filter = {
            userId: 'user123',
            theme: 'Adventure',
        };
        const histories = [
            HistoryEntity.restore({
                id: 'history123',
                userId: 'user123',
                content: 'Content',
                theme: 'Adventure',
                isActive: true,
                generateAt: new Date('2024-01-01'),
            }),
        ];
        const expectedResult = ResultEntity.success(histories);

        mockHistoryRepository.getHistoriesByFilter.mockResolvedValue(expectedResult);

        const result = await useCase.execute(filter);

        expect(result).toBe(expectedResult);
        expect(mockHistoryRepository.getHistoriesByFilter.mock.calls).toEqual([[filter]]);
    });

    it('should return repository failure', async () => {
        const filter = {
            userId: 'user123',
        };
        const expectedResult = ResultEntity.failure<HistoryEntity[]>(
            ErrorEntity.DatabaseError('Failed to retrieve histories'),
        );

        mockHistoryRepository.getHistoriesByFilter.mockResolvedValue(expectedResult);

        const result = await useCase.execute(filter);

        expect(result).toBe(expectedResult);
        expect(result.isFailure).toBe(true);
    });
});
