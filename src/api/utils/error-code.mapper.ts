import { ErrorCodes } from '@domain/abstractions/error.entity';

export class ErrorCodeMapper {
    static toHttpStatusCode(errorCode: ErrorCodes): number {
        switch (errorCode) {
            case ErrorCodes.DatabaseError:
                return 500; // Internal Server Error
            case ErrorCodes.NotFound:
                return 404; // Not Found
            case ErrorCodes.ValidationError:
                return 400; // Bad Request
            case ErrorCodes.NullValue:
                return 400; // Bad Request
            case ErrorCodes.AuthenticationError:
                return 401; // Unauthorized
            case ErrorCodes.SDKError:
                return 500; // Internal Server Error
            case ErrorCodes.None:
                return 200; // OK
            case ErrorCodes.InternalServerError:
                return 500; // Internal Server Error
            default:
                return 500; // Internal Server Error for unknown error codes
        }
    }
}
