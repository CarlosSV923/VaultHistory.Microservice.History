import { ApplicationModule } from '@application/application.module';
import {
    DeactivateHistoriesByUserIdUseCase,
    DeactivateHistoryByIdUseCase,
    GenerateHistoryUseCase,
    GetHistoriesByFilterUseCase,
} from '@application/use-cases';

const getModuleMetadata = (key: string): unknown[] => {
    const metadata: unknown = Reflect.getMetadata(key, ApplicationModule);
    return Array.isArray(metadata) ? metadata : [];
};

describe('ApplicationModule', () => {
    it('should be defined', () => {
        expect(ApplicationModule).toBeDefined();
    });

    it('should provide application use cases', () => {
        const providers = getModuleMetadata('providers');

        expect(providers).toContain(GenerateHistoryUseCase);
        expect(providers).toContain(GetHistoriesByFilterUseCase);
        expect(providers).toContain(DeactivateHistoryByIdUseCase);
        expect(providers).toContain(DeactivateHistoriesByUserIdUseCase);
    });

    it('should export application use cases', () => {
        const exports = getModuleMetadata('exports');

        expect(exports).toContain(GenerateHistoryUseCase);
        expect(exports).toContain(GetHistoriesByFilterUseCase);
        expect(exports).toContain(DeactivateHistoryByIdUseCase);
        expect(exports).toContain(DeactivateHistoriesByUserIdUseCase);
    });
});
