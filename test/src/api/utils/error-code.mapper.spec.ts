import { ErrorCodeMapper } from '@api/utils/error-code.mapper';
import { ErrorCodes } from '@domain/abstractions/error.entity';

describe('ErrorCodeMapper', () => {
    it.each([
        [ErrorCodes.DatabaseError, 500],
        [ErrorCodes.NotFound, 404],
        [ErrorCodes.ValidationError, 400],
        [ErrorCodes.NullValue, 400],
        [ErrorCodes.AuthenticationError, 401],
        [ErrorCodes.SDKError, 500],
        [ErrorCodes.None, 200],
        [ErrorCodes.InternalServerError, 500],
    ])('should map %s to %i', (errorCode, statusCode) => {
        expect(ErrorCodeMapper.toHttpStatusCode(errorCode)).toBe(statusCode);
    });

    it('should map unknown error code to internal server error', () => {
        expect(ErrorCodeMapper.toHttpStatusCode('Unknown' as ErrorCodes)).toBe(500);
    });
});
