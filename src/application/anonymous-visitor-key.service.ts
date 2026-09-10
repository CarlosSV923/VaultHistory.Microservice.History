import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';
import { ErrorEntity } from '@domain/abstractions/error.entity';
import { ResultEntity } from '@domain/abstractions/result.entity';
import { normalizeAnonymousIp } from './anonymous-ip.normalizer';

type HmacKey = {
    id: string;
    secret: string;
};

@Injectable()
export class AnonymousVisitorKeyService {
    private readonly keys: HmacKey[];

    constructor(configService: ConfigService) {
        const configured = configService.get<string>('ANONYMOUS_VISITOR_HMAC_KEYS');
        if (!configured) {
            throw new Error('ANONYMOUS_VISITOR_HMAC_KEYS must contain at least one key id and secret');
        }

        this.keys = configured.split(',').map((entry) => {
            const separator = entry.indexOf(':');
            const id = entry.slice(0, separator).trim();
            const secret = entry.slice(separator + 1).trim();
            if (separator <= 0 || !/^[A-Za-z0-9_-]+$/.test(id) || secret.length < 16) {
                throw new Error(
                    'ANONYMOUS_VISITOR_HMAC_KEYS entries must use keyId:secret with a secret of at least 16 characters',
                );
            }
            return { id, secret };
        });

        if (new Set(this.keys.map((key) => key.id)).size !== this.keys.length) {
            throw new Error('ANONYMOUS_VISITOR_HMAC_KEYS key ids must be unique');
        }
    }

    createCurrentKey(ip: string): ResultEntity<string> {
        const normalizedIp = normalizeAnonymousIp(ip);
        if (normalizedIp.isFailure) return ResultEntity.failure(normalizedIp.error);
        return ResultEntity.success(this.hmac(this.keys[0]!, normalizedIp.Value));
    }

    createLookupKeys(ip: string): ResultEntity<string[]> {
        const normalizedIp = normalizeAnonymousIp(ip);
        if (normalizedIp.isFailure) return ResultEntity.failure(normalizedIp.error);
        return ResultEntity.success(this.keys.map((key) => this.hmac(key, normalizedIp.Value)));
    }

    private hmac(key: HmacKey, normalizedIp: string): string {
        return `${key.id}:${createHmac('sha256', key.secret).update(normalizedIp).digest('base64url')}`;
    }
}
