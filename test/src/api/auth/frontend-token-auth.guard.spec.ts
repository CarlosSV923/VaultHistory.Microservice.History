import { FrontendTokenAuthGuard } from '@api/auth/frontend-token-auth.guard';
import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';

const contextFor = (authorization?: string): ExecutionContext =>
    ({ switchToHttp: () => ({ getRequest: () => ({ headers: { authorization } }) }) }) as unknown as ExecutionContext;

describe('FrontendTokenAuthGuard', () => {
    const token = 'frontend-fixed-token';
    const config = { get: jest.fn().mockReturnValue(token) } as unknown as jest.Mocked<Pick<ConfigService, 'get'>>;
    const guard = new FrontendTokenAuthGuard(config as unknown as ConfigService);

    it('accepts only the configured AUTH_TOKEN_FORNT value', () => {
        expect(guard.canActivate(contextFor(token))).toBe(true);
        expect(() => guard.canActivate(contextFor('Bearer ' + token))).toThrow(UnauthorizedException);
        expect(() => guard.canActivate(contextFor())).toThrow(UnauthorizedException);
    });
});
