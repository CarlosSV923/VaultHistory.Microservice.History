import { HistoryRepositoryPortToken } from '@domain/histories/ports/history-repository.port';
import { AIServicePortToken } from '@domain/histories/ports/ai-service.port';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

type ProviderMetadata = {
    provide?: unknown;
};

const getModuleMetadata = (key: string): unknown[] => {
    const metadata: unknown = Reflect.getMetadata(key, InfrastructureModule);
    return Array.isArray(metadata) ? metadata : [];
};

const isProviderMetadata = (metadata: unknown): metadata is ProviderMetadata =>
    typeof metadata === 'object' && metadata !== null && 'provide' in metadata;

describe('InfrastructureModule', () => {
    it('should be defined', () => {
        expect(InfrastructureModule).toBeDefined();
    });

    it('should have providers array', () => {
        const metadata = getModuleMetadata('providers');
        expect(metadata).toBeDefined();
        expect(Array.isArray(metadata)).toBe(true);
    });

    it('should have imports array', () => {
        const metadata = getModuleMetadata('imports');
        expect(metadata).toBeDefined();
        expect(Array.isArray(metadata)).toBe(true);
    });

    it('should have exports array', () => {
        const metadata = getModuleMetadata('exports');
        expect(metadata).toBeDefined();
        expect(Array.isArray(metadata)).toBe(true);
    });

    it('should export HistoryRepositoryPortToken', () => {
        const metadata = getModuleMetadata('exports');
        const hasHistoryRepoToken = metadata.some(
            (exp) => isProviderMetadata(exp) && exp.provide === HistoryRepositoryPortToken,
        );
        expect(hasHistoryRepoToken).toBe(true);
    });

    it('should export AIServicePortToken', () => {
        const metadata = getModuleMetadata('exports');
        const hasAIServiceToken = metadata.some(
            (exp) => isProviderMetadata(exp) && exp.provide === AIServicePortToken,
        );
        expect(hasAIServiceToken).toBe(true);
    });
});
