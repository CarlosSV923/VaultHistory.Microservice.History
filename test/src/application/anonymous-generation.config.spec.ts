import { AnonymousGenerationConfig } from '@application/anonymous-generation.config';
import { type ConfigService } from '@nestjs/config';

const configFor = (value?: string): ConfigService =>
    ({ get: jest.fn().mockReturnValue(value) }) as unknown as ConfigService;

describe('AnonymousGenerationConfig', () => {
    it('uses a daily limit of three when no value is configured', () => {
        expect(new AnonymousGenerationConfig(configFor()).dailyLimit).toBe(3);
    });

    it.each(['-1', '1.5', 'abc', ' 3 ', '9007199254740992'])('rejects invalid limit %s', (value) => {
        expect(() => new AnonymousGenerationConfig(configFor(value))).toThrow(
            'ANONYMOUS_DAILY_LIMIT must be a safe integer greater than or equal to 0',
        );
    });
});
