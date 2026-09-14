import {
    type CanActivate,
    type ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type Request } from 'express';

@Injectable()
export class FrontendTokenAuthGuard implements CanActivate {
    constructor(private readonly configService: ConfigService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const token = request.headers.authorization;
        const configuredToken = this.configService.get<string>('AUTH_TOKEN_FORNT');

        if (!configuredToken || typeof token !== 'string' || token !== configuredToken) {
            throw new UnauthorizedException();
        }

        return true;
    }
}
