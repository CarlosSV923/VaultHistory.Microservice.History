import * as jwt from 'jsonwebtoken';

type AuthTokenOverrides = Partial<{
    sub: string;
    email: string;
    name: string;
}>;

export function createAuthToken(overrides: AuthTokenOverrides = {}): string {
    const secret = process.env.JWT_SECRET ?? 'integration-secret';
    const issuer = process.env.JWT_ISSUER ?? 'vault-history-test';
    const audience = process.env.JWT_AUDIENCE ?? 'vault-history-users';

    return jwt.sign(
        {
            sub: overrides.sub ?? 'user-123',
            email: overrides.email ?? 'user@test.com',
            name: overrides.name ?? 'Test User',
        },
        secret,
        {
            algorithm: 'HS256',
            issuer,
            audience,
            expiresIn: '1h',
        },
    );
}
