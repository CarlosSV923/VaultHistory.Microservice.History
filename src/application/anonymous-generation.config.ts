import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AnonymousGenerationConfig {
    readonly dailyLimit: number;

    constructor(configService: ConfigService) {
        const configured = configService.get<string>('ANONYMOUS_DAILY_LIMIT');
        const value = configured ?? '3';

        if (!/^(0|[1-9]\d*)$/.test(value)) {
            throw new Error('ANONYMOUS_DAILY_LIMIT must be a safe integer greater than or equal to 0');
        }

        const dailyLimit = Number(value);
        if (!Number.isSafeInteger(dailyLimit) || dailyLimit < 0) {
            throw new Error('ANONYMOUS_DAILY_LIMIT must be a safe integer greater than or equal to 0');
        }

        this.dailyLimit = dailyLimit;
    }
}
