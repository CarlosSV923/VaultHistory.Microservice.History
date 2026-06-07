import { AIServicePortToken } from '@domain/histories/ports/ai-service.port';

describe('AIServicePort', () => {
    it('should expose a stable injection token description', () => {
        expect(typeof AIServicePortToken).toBe('symbol');
        expect(AIServicePortToken.description).toBe('AIServicePort');
    });
});
