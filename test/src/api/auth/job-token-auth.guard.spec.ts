import { JobTokenAuthGuard } from '@api/auth/job-token-auth.guard';
import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';

const executionContextFor = (authorization?: string): ExecutionContext =>
    ({
        switchToHttp: () => ({
            getRequest: () => ({ headers: { authorization } }),
        }),
    }) as unknown as ExecutionContext;

describe('JobTokenAuthGuard', () => {
    const configuredToken = 'job-secret-token';
    let configService: jest.Mocked<Pick<ConfigService, 'get'>>;
    let guard: JobTokenAuthGuard;

    beforeEach(() => {
        configService = {
            get: jest.fn().mockReturnValue(configuredToken),
        };
        guard = new JobTokenAuthGuard(configService as unknown as ConfigService);
    });

    it('authorizes a request with the configured authorization token', () => {
        expect(guard.canActivate(executionContextFor(configuredToken))).toBe(true);
    });

    it.each([undefined, 'invalid-token'])('rejects a request with token %p', (token) => {
        expect(() => guard.canActivate(executionContextFor(token))).toThrow(UnauthorizedException);
    });

    it('rejects requests when AUTH_TOKEN_JOB is not configured', () => {
        configService.get.mockReturnValue(undefined);

        expect(() => guard.canActivate(executionContextFor(configuredToken))).toThrow(
            UnauthorizedException,
        );
    });
});
