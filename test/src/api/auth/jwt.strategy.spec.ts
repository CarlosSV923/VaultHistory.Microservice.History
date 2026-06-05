import { JwtStrategy } from '@api/auth/jwt.strategy';
import { type ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
    it('should map jwt payload to authenticated user', () => {
        const configService = {
            getOrThrow: jest.fn((key: string) => `${key}-value`),
        } as unknown as ConfigService;
        const strategy = new JwtStrategy(configService);

        const user = strategy.validate({
            sub: 'user123',
            email: 'user@example.com',
            name: 'Test User',
        });

        expect(user).toEqual({
            userId: 'user123',
            email: 'user@example.com',
            fullName: 'Test User',
        });
    });
});
