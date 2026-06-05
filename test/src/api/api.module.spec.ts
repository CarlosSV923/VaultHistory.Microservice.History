import { ApiModule } from '@api/api.module';
import { JwtAuthGuard } from '@api/auth/jwt-auth.guard';
import { JwtStrategy } from '@api/auth/jwt.strategy';
import { HistoryController } from '@api/controllers/history.controller';

const getModuleMetadata = (key: string): unknown[] => {
    const metadata: unknown = Reflect.getMetadata(key, ApiModule);
    return Array.isArray(metadata) ? metadata : [];
};

describe('ApiModule', () => {
    it('should be defined', () => {
        expect(ApiModule).toBeDefined();
    });

    it('should register api controllers', () => {
        expect(getModuleMetadata('controllers')).toContain(HistoryController);
    });

    it('should provide and export auth providers', () => {
        expect(getModuleMetadata('providers')).toEqual(
            expect.arrayContaining([JwtStrategy, JwtAuthGuard]),
        );
        expect(getModuleMetadata('exports')).toEqual(
            expect.arrayContaining([JwtStrategy, JwtAuthGuard]),
        );
    });
});
