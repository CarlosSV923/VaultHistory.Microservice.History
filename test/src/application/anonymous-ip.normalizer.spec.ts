import { normalizeAnonymousIp } from '@application/anonymous-ip.normalizer';

describe('normalizeAnonymousIp', () => {
    it('canonicalizes IPv4-mapped IPv6 to the IPv4 quota key', () => {
        expect(normalizeAnonymousIp('::ffff:198.51.100.7').Value).toBe('198.51.100.7');
    });

    it.each(['198.51.100.0/24', 'not-an-ip', '198.51.100.7, 203.0.113.1'])('rejects %s', (ip) => {
        expect(normalizeAnonymousIp(ip).isFailure).toBe(true);
    });
});
