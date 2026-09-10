import { AnonymousVisitorKeyService } from '@application/anonymous-visitor-key.service';
import { GetAnonymousHistoriesUseCase } from '@application/use-cases/get-anonymous-histories.use-case';
import { ResultEntity } from '@domain/abstractions/result.entity';
import type { HistoryRepositoryPort } from '@domain/histories/ports/history-repository.port';

describe('GetAnonymousHistoriesUseCase', () => {
    it('uses all HMAC versions for the resolved visitor IP', async () => {
        const repository = {
            getAnonymousHistoriesByFilter: jest.fn().mockResolvedValue(ResultEntity.success({ histories: [], total: 0 })),
        } as unknown as jest.Mocked<HistoryRepositoryPort>;
        const keys = new AnonymousVisitorKeyService({
            get: jest.fn().mockReturnValue('v2:new-secret-at-least-16,v1:old-secret-at-least-16'),
        } as never);
        const useCase = new GetAnonymousHistoriesUseCase(repository, keys);

        const result = await useCase.execute({ ip: '::ffff:198.51.100.27', page: 2, pageSize: 10 });

        expect(result.isSuccess).toBe(true);
        expect(repository.getAnonymousHistoriesByFilter).toHaveBeenCalledWith({
            anonymousVisitorKeys: keys.createLookupKeys('198.51.100.27').Value,
            page: 2,
            pageSize: 10,
        });
    });
});
