import { Injectable } from '@nestjs/common';

export interface AnonymousGenerationClock {
    now(): Date;
}

export const AnonymousGenerationClockToken = Symbol('AnonymousGenerationClock');

@Injectable()
export class SystemAnonymousGenerationClock implements AnonymousGenerationClock {
    now(): Date {
        return new Date();
    }
}
