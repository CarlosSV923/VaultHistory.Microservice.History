import { ErrorEntity } from '@domain/abstractions/error.entity';
import { ResultEntity } from '@domain/abstractions/result.entity';
import * as ipaddr from 'ipaddr.js';

export function normalizeAnonymousIp(ip: string): ResultEntity<string> {
    if (!ipaddr.isValid(ip)) {
        return ResultEntity.failure(ErrorEntity.ValidationError('ip must be a single valid IPv4 or IPv6 address'));
    }

    return ResultEntity.success(ipaddr.process(ip).toString());
}
