export enum ErrorCodes {
    DatabaseError = 'Error.DatabaseError',
    NotFound = 'Error.NotFound',
    ValidationError = 'Error.ValidationError',
    NullValue = 'Error.NullValue',
    AuthenticationError = 'Error.AuthenticationError',
    SDKError = 'Error.SDKError',
    None = 'Error.None',
    InternalServerError = 'Error.InternalServerError',
    AnonymousGenerationDisabled = 'ANONYMOUS_GENERATION_DISABLED',
    AnonymousDailyLimitExceeded = 'ANONYMOUS_DAILY_LIMIT_EXCEEDED',
    AnonymousUsageUnavailable = 'ANONYMOUS_USAGE_UNAVAILABLE',
    AnonymousGenerationUnavailable = 'ANONYMOUS_GENERATION_UNAVAILABLE',
    AnonymousHistoryPersistenceFailed = 'ANONYMOUS_HISTORY_PERSISTENCE_FAILED',
}

export class ErrorEntity {
    constructor(
        public readonly code: ErrorCodes,
        public readonly message: string,
    ) {}

    static readonly None = new ErrorEntity(ErrorCodes.None, 'No error');
    static readonly NullValue = new ErrorEntity(ErrorCodes.NullValue, 'El valor no puede ser nulo');
    static readonly InternalServerError = new ErrorEntity(
        ErrorCodes.InternalServerError,
        'Error interno del servidor',
    );

    static readonly AuthenticationError = new ErrorEntity(
        ErrorCodes.AuthenticationError,
        'Error de autenticación',
    );

    static DatabaseError(message: string): ErrorEntity {
        return new ErrorEntity(ErrorCodes.DatabaseError, message);
    }

    static NotFound(message: string): ErrorEntity {
        return new ErrorEntity(ErrorCodes.NotFound, message);
    }

    static ValidationError(message: string): ErrorEntity {
        return new ErrorEntity(ErrorCodes.ValidationError, message);
    }

    static SDKError(message: string): ErrorEntity {
        return new ErrorEntity(ErrorCodes.SDKError, message);
    }

    static AnonymousGenerationDisabled(): ErrorEntity {
        return new ErrorEntity(ErrorCodes.AnonymousGenerationDisabled, 'La generación anónima está deshabilitada');
    }

    static AnonymousDailyLimitExceeded(): ErrorEntity {
        return new ErrorEntity(ErrorCodes.AnonymousDailyLimitExceeded, 'Se alcanzó el cupo diario de generaciones anónimas');
    }

    static AnonymousUsageUnavailable(): ErrorEntity {
        return new ErrorEntity(ErrorCodes.AnonymousUsageUnavailable, 'No se pudo verificar el cupo anónimo');
    }

    static AnonymousGenerationUnavailable(): ErrorEntity {
        return new ErrorEntity(ErrorCodes.AnonymousGenerationUnavailable, 'La generación anónima no está disponible');
    }

    static AnonymousHistoryPersistenceFailed(): ErrorEntity {
        return new ErrorEntity(ErrorCodes.AnonymousHistoryPersistenceFailed, 'No se pudo guardar la historia anónima');
    }
}
