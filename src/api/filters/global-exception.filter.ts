import { ErrorEntity } from '@domain/abstractions/error.entity';
import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof NotFoundException) {
            response.status(404).json({ ...ErrorEntity.NotFound('Resource not found') });
            return;
        }

        if (exception instanceof UnauthorizedException) {
            response.status(401).json({ ...ErrorEntity.AuthenticationError });
            return;
        }

        this.logger.error(
            'Unhandled exception caught' +
                (exception instanceof Error ? ': ' + exception.message : ''),
            exception instanceof Error ? exception.stack : '',
        );
        response.status(500).json({ ...ErrorEntity.InternalServerError });
    }
}
