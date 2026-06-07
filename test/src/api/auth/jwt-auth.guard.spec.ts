import { JwtAuthGuard } from '@api/auth/jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;

    beforeEach(() => {
        guard = new JwtAuthGuard();
    });

    it('should return user when authentication succeeds', () => {
        const user = {
            userId: 'user123',
            email: 'user@example.com',
            fullName: 'Test User',
        };

        expect(guard.handleRequest(null, user, null)).toBe(user);
    });

    it('should throw unauthorized when passport returns an error', () => {
        expect(() => guard.handleRequest(new Error('Invalid token'), null, null)).toThrow(
            UnauthorizedException,
        );
    });

    it('should throw unauthorized when user is missing', () => {
        expect(() =>
            guard.handleRequest(null, null, {
                name: 'TokenExpiredError',
                message: 'jwt expired',
            }),
        ).toThrow(UnauthorizedException);
    });
});
