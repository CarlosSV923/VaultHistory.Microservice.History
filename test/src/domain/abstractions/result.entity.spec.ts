import { ErrorCodes, ErrorEntity } from '@domain/abstractions/error.entity';
import { ResultEntity } from '@domain/abstractions/result.entity';

describe('ResultEntity', () => {
    describe('success', () => {
        it('should create a successful result with value', () => {
            const result = ResultEntity.success('content');

            expect(result.isSuccess).toBe(true);
            expect(result.isFailure).toBe(false);
            expect(result.error).toBe(ErrorEntity.None);
            expect(result.Value).toBe('content');
        });

        it('should throw when successful result has no value', () => {
            const result = ResultEntity.success();

            expect(result.isSuccess).toBe(true);
            expect(result.isFailure).toBe(false);
            expect(() => result.Value).toThrow('No value present');
        });

        it('should throw when successful result has a null value', () => {
            const result = ResultEntity.success<string | null>(null);

            expect(() => result.Value).toThrow('No value present');
        });
    });

    describe('failure', () => {
        it('should create a failure result with error', () => {
            const error = ErrorEntity.ValidationError('Invalid input');

            const result = ResultEntity.failure<string>(error);

            expect(result.isSuccess).toBe(false);
            expect(result.isFailure).toBe(true);
            expect(result.error).toBe(error);
            expect(result.error.code).toBe(ErrorCodes.ValidationError);
            expect(() => result.Value).toThrow('No value present');
        });
    });
});
