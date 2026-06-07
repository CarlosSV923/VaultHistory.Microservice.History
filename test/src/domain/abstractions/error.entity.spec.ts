import { ErrorCodes, ErrorEntity } from '@domain/abstractions/error.entity';

describe('ErrorEntity', () => {
    it('should expose static predefined errors', () => {
        expect(ErrorEntity.None.code).toBe(ErrorCodes.None);
        expect(ErrorEntity.None.message).toBe('No error');
        expect(ErrorEntity.NullValue.code).toBe(ErrorCodes.NullValue);
        expect(ErrorEntity.InternalServerError.code).toBe(ErrorCodes.InternalServerError);
        expect(ErrorEntity.AuthenticationError.code).toBe(ErrorCodes.AuthenticationError);
    });

    it('should create database error with custom message', () => {
        const error = ErrorEntity.DatabaseError('Database failed');

        expect(error.code).toBe(ErrorCodes.DatabaseError);
        expect(error.message).toBe('Database failed');
    });

    it('should create not found error with custom message', () => {
        const error = ErrorEntity.NotFound('History not found');

        expect(error.code).toBe(ErrorCodes.NotFound);
        expect(error.message).toBe('History not found');
    });

    it('should create validation error with custom message', () => {
        const error = ErrorEntity.ValidationError('Invalid data');

        expect(error.code).toBe(ErrorCodes.ValidationError);
        expect(error.message).toBe('Invalid data');
    });

    it('should create SDK error with custom message', () => {
        const error = ErrorEntity.SDKError('SDK failed');

        expect(error.code).toBe(ErrorCodes.SDKError);
        expect(error.message).toBe('SDK failed');
    });
});
