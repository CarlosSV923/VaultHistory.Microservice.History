import { GetAnonymousHistoriesUseCase } from '@application/use-cases/get-anonymous-histories.use-case';
import { ResultEntity } from '@domain/abstractions/result.entity';
import type { HistoryRepositoryPort } from '@domain/histories/ports/history-repository.port';

describe('GetAnonymousHistoriesUseCase', () => {
    it('uses the normalized IP supplied by the frontend guard client', async () => {
        const repository = {
            getAnonymousHistoriesByFilter: jest.fn().mockResolvedValue(ResultEntity.success({ histories: [], total: 0 })),
        } as unknown as jest.Mocked<HistoryRepositoryPort>;
        const useCase = new GetAnonymousHistoriesUseCase(repository);

        const result = await useCase.execute({ ip: '::ffff:198.51.100.27', page: 2, pageSize: 10 });

        expect(result.isSuccess).toBe(true);
        expect(repository.getAnonymousHistoriesByFilter).toHaveBeenCalledWith({
            anonymousVisitorKeys: ['198.51.100.27'],
            page: 2,
            pageSize: 10,
        });
    });
});
