import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '@api/auth/authenticated-user';
import { JwtPayload } from './jwt.payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(configService: ConfigService) {
        const jwtSecret = configService.getOrThrow<string>('JWT_SECRET');
        const jwtIssuer = configService.getOrThrow<string>('JWT_ISSUER');
        const jwtAudience = configService.getOrThrow<string>('JWT_AUDIENCE');

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret,
            issuer: jwtIssuer,
            audience: jwtAudience,
            algorithms: ['HS256'],
            ignoreExpiration: false,
        });
    }

    validate(payload: JwtPayload): AuthenticatedUser {
        return {
            userId: payload.sub,
            email: payload.email,
            fullName: payload.name,
        };
    }
}
