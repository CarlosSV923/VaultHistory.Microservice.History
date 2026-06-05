// src/api/auth/jwt-auth.guard.ts
import { AuthenticatedUser } from '@api/context/authenticated-user';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);

    handleRequest<TUser = AuthenticatedUser>(err: unknown, user: TUser, info: unknown): TUser {
        if (err) {
            const { message, stack } =
                err instanceof Error ? err : { message: 'Unknown error', stack: undefined };
            this.logger.error(`Authentication error: ${message}`, stack);
            throw new UnauthorizedException();
        }
        if (!user) {
            this.logger.warn(`Unauthorized access attempt: ${this.logErrorMessage(info)}`);
            throw new UnauthorizedException();
        }
        return user;
    }

    private logErrorMessage(info: unknown): string {
        const error = info as { name?: string; message?: string } | undefined;

        if (error?.name === 'TokenExpiredError') {
            return 'Token has expired';
        }

        if (error?.name === 'JsonWebTokenError') {
            return 'Invalid token - ' + (error.message || 'Unknown JWT error');
        }

        if (error?.name === 'NotBeforeError') {
            return 'Token not active';
        }

        return 'Unauthorized';
    }
}
