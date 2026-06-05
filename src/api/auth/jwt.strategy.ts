import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { type ConfigService } from '@nestjs/config';
import { type AuthenticatedUser } from '@api/auth/authenticated-user';
import { type JwtPayload } from './jwt.payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.getOrThrow<string>('JWT_PRIVATE_KEY'),
            issuer: configService.getOrThrow<string>('JWT_ISSUER'),
            audience: configService.getOrThrow<string>('JWT_AUDIENCE'),
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
