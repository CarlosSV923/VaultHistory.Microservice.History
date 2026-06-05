import { HistoryRepositoryPortToken } from '@domain/histories/ports/history-repository.port';

describe('HistoryRepositoryPort', () => {
    it('should expose a stable injection token description', () => {
        expect(typeof HistoryRepositoryPortToken).toBe('symbol');
        expect(HistoryRepositoryPortToken.description).toBe('HistoryRepositoryPort');
    });
});
