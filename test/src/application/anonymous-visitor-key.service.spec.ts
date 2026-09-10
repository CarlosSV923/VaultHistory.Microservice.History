import { AnonymousVisitorKeyService } from '@application/anonymous-visitor-key.service';

describe('AnonymousVisitorKeyService', () => {
    const createService = (keys = 'v2:new-secret-at-least-16,v1:old-secret-at-least-16') =>
        new AnonymousVisitorKeyService({ get: jest.fn().mockReturnValue(keys) } as never);

    it('creates the same key for IPv4 and its mapped IPv6 form without exposing the IP', () => {
        const service = createService();
        const ipv4 = service.createCurrentKey('198.51.100.27');
        const mapped = service.createCurrentKey('::ffff:198.51.100.27');

        expect(ipv4.Value).toBe(mapped.Value);
        expect(ipv4.Value).toMatch(/^v2:/);
        expect(ipv4.Value).not.toContain('198.51.100.27');
    });

    it('returns keys for every configured version during rotation', () => {
        const result = createService().createLookupKeys('203.0.113.10');

        expect(result.Value).toHaveLength(2);
        expect(result.Value).toEqual([expect.stringMatching(/^v2:/), expect.stringMatching(/^v1:/)]);
    });

    it('rejects an invalid key configuration', () => {
        expect(() => createService('v1:short')).toThrow('ANONYMOUS_VISITOR_HMAC_KEYS');
    });
});
