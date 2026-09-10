import { type INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { type MongoMemoryServer } from 'mongodb-memory-server';
import { type Model } from 'mongoose';
import request, { type Response } from 'supertest';
import { type App } from 'supertest/types';
import { ErrorCodes, ErrorEntity } from '../../src/domain/abstractions/error.entity';
import { ResultEntity } from '../../src/domain/abstractions/result.entity';
import { History, type HistoryDocument } from '../../src/infrastructure/database/history.model';
import {
    AnonymousDailyUsage,
    type AnonymousDailyUsageDocument,
} from '../../src/infrastructure/database/anonymous-daily-usage.model';
import { createAuthToken } from './auth.helper';
import { createIntegrationApp } from './test-app.factory';
import {
    HistoryType,
    type HistoryType as HistoryTypeValue,
} from '../../src/domain/histories/history.type.enum';

type GenerateHistoryResponseBody = {
    history: string;
};

type ErrorResponseBody = {
    code: ErrorCodes;
    message: string;
};

type AnonymousUsage = {
    limit: number;
    remaining: number;
    resetAt: string;
};

type AnonymousHistoryResponseBody = GenerateHistoryResponseBody & { usage: AnonymousUsage };

type HistoryResponseBody = {
    id: string;
    content: string;
    type: HistoryTypeValue;
    date?: string;
    theme?: string;
    character?: string;
    generateAt: string;
};

type GetHistoriesResponseBody = {
    histories: HistoryResponseBody[];
    meta: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
};

type MessageResponseBody = {
    message: string;
};

function bodyOf<TBody>(response: Response): TBody {
    return response.body as TBody;
}

describe('History API integration', () => {
    let app: INestApplication;
    let mongo: MongoMemoryServer;
    let historyModel: Model<HistoryDocument>;
    let anonymousUsageModel: Model<AnonymousDailyUsageDocument>;
    let aiMock: {
        generateContent: jest.Mock;
    };

    beforeAll(async () => {
        const setup = await createIntegrationApp();

        app = setup.app;
        mongo = setup.mongo;
        aiMock = setup.aiMock;
        historyModel = app.get<Model<HistoryDocument>>(getModelToken(History.name));
        anonymousUsageModel = app.get<Model<AnonymousDailyUsageDocument>>(
            getModelToken(AnonymousDailyUsage.name),
        );
    });

    afterEach(async () => {
        await historyModel.deleteMany({});
        await anonymousUsageModel.deleteMany({});
        jest.clearAllMocks();
        aiMock.generateContent.mockResolvedValue(
            ResultEntity.success('Generated integration history'),
        );
    });

    afterAll(async () => {
        await app.close();
        await mongo.stop();
    });

    function api(): ReturnType<typeof request> {
        const httpServer = app.getHttpServer() as App;

        return request(httpServer);
    }

    it('generates a subscription history with the configured job token', async () => {
        const response = await api()
            .post('/api/v1/history/generate/subscription')
            .set('Authorization', 'integration-job-token')
            .send({ userId: 'subscription-user', theme: 'fantasy' })
            .expect(201);

        expect(bodyOf<GenerateHistoryResponseBody>(response)).toEqual({
            history: 'Generated integration history',
        });
        expect(aiMock.generateContent).toHaveBeenCalledWith({
            userId: 'subscription-user',
            theme: 'fantasy',
            type: HistoryType.SUBSCRIPTION,
        });
    });

    it('generates an anonymous history with the fixed frontend token and does not persist an IP', async () => {
        const response = await api()
            .post('/api/v1/history/generate/anonymous')
            .set('Authorization', 'integration-frontend-token')
            .set('X-Forwarded-For', '203.0.113.8')
            .send({ theme: 'fantasy' })
            .expect(201);

        expect(bodyOf<AnonymousHistoryResponseBody>(response)).toMatchObject({
            history: 'Generated integration history',
            usage: { limit: 3, remaining: 2 },
        });
        expect(aiMock.generateContent).toHaveBeenCalledWith({
            theme: 'fantasy',
            type: HistoryType.ANONYMOUS,
        });
        const saved = await historyModel.findOne({ type: HistoryType.ANONYMOUS }).select('+anonymousVisitorKey').lean();
        expect(saved).toMatchObject({ content: 'Generated integration history', type: HistoryType.ANONYMOUS });
        expect(saved).not.toHaveProperty('ip');
        expect(saved?.anonymousVisitorKey).toMatch(/^v1:/);
        expect(saved?.userId).toBeUndefined();
    });

    it.each([undefined, 'invalid-frontend-token'])(
        'rejects anonymous generation with frontend token %p',
        async (token) => {
            const requestBuilder = api().post('/api/v1/history/generate/anonymous');
            if (token) requestBuilder.set('Authorization', token);

            await requestBuilder.set('X-Forwarded-For', '203.0.113.9').send({}).expect(401);
            expect(aiMock.generateContent).not.toHaveBeenCalled();
        },
    );

    it('rejects anonymous payload fields outside the supported contract before consuming quota', async () => {
        await api()
            .post('/api/v1/history/generate/anonymous')
            .set('Authorization', 'integration-frontend-token')
            .set('X-Forwarded-For', '203.0.113.9')
            .send({ ip: '203.0.113.9', userId: 'untrusted-user', type: HistoryType.QUERY })
            .expect(400);

        expect(aiMock.generateContent).not.toHaveBeenCalled();
        expect(await anonymousUsageModel.countDocuments()).toBe(0);
    });

    it('shares the quota between IPv4 and IPv4-mapped IPv6 and admits only the configured concurrent requests', async () => {
        const requests = Array.from({ length: 10 }, (_, index) =>
            api()
                .post('/api/v1/history/generate/anonymous')
                .set('Authorization', 'integration-frontend-token')
                .set('X-Forwarded-For', index % 2 === 0 ? '198.51.100.27' : '::ffff:198.51.100.27')
                .send({}),
        );
        const responses = await Promise.all(requests);
        const created = responses.filter((response) => response.status === 201);
        const exhausted = responses.filter((response) => response.status === 429);

        expect(created).toHaveLength(3);
        expect(exhausted).toHaveLength(7);
        expect(exhausted.every((response) => response.headers['retry-after'])).toBe(true);
        expect(await anonymousUsageModel.find({}).lean()).toEqual([expect.objectContaining({ used: 3 })]);
        expect(await anonymousUsageModel.collection.indexes()).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ key: { anonymousVisitorKey: 1, day: 1 }, unique: true }),
            ]),
        );
        expect(await historyModel.countDocuments({ type: HistoryType.ANONYMOUS })).toBe(3);
    });

    it('keeps consumed anonymous usage when generation or persistence fails', async () => {
        aiMock.generateContent.mockResolvedValueOnce(ResultEntity.failure(ErrorEntity.SDKError('Gemini failed')));
        const generationFailure = await api()
            .post('/api/v1/history/generate/anonymous')
            .set('Authorization', 'integration-frontend-token')
            .set('X-Forwarded-For', '203.0.113.10')
            .send({})
            .expect(503);
        expect(bodyOf<ErrorResponseBody>(generationFailure).code).toBe(
            ErrorCodes.AnonymousGenerationUnavailable,
        );

        const usageAfterGenerationFailure = await anonymousUsageModel.findOne({}).lean();
        expect(usageAfterGenerationFailure?.used).toBe(1);
    });

    it.each([undefined, 'invalid-job-token'])(
        'rejects subscription generation with job token %p',
        async (token) => {
            const requestBuilder = api().post('/api/v1/history/generate/subscription');

            if (token) {
                requestBuilder.set('Authorization', token);
            }

            await requestBuilder.send({ userId: 'subscription-user' }).expect(401);

            expect(aiMock.generateContent).not.toHaveBeenCalled();
        },
    );

    it('generates a history and persists it for the authenticated user', async () => {
        const token = createAuthToken({ sub: 'user-abc' });

        const response = await api()
            .post('/api/v1/history/generate/query')
            .set('Authorization', `Bearer ${token}`)
            .send({
                date: '1999-12-31',
                theme: 'medieval fantasy',
                character: 'Arthur',
            })
            .expect(201);
        const body = bodyOf<GenerateHistoryResponseBody>(response);

        expect(body).toEqual({
            history: 'Generated integration history',
        });
        expect(aiMock.generateContent).toHaveBeenCalledWith({
            userId: 'user-abc',
            date: '1999-12-31',
            theme: 'medieval fantasy',
            character: 'Arthur',
            type: HistoryType.QUERY,
        });

        const saved = await historyModel.findOne({ userId: 'user-abc' }).lean();

        expect(saved).toMatchObject({
            userId: 'user-abc',
            content: 'Generated integration history',
            date: '1999-12-31',
            theme: 'medieval fantasy',
            character: 'Arthur',
            isActive: true,
            type: HistoryType.QUERY,
        });
    });

    it('rejects public generation fields that could override the authenticated identity or server-selected type', async () => {
        const token = createAuthToken({ sub: 'user-a' });

        await api()
            .post('/api/v1/history/generate/query')
            .set('Authorization', `Bearer ${token}`)
            .send({
                userId: 'user-b',
                type: HistoryType.SUBSCRIPTION,
                idempotencyKey: 'user-b:2026',
                theme: 'fantasy',
            })
            .expect(400);

        expect(aiMock.generateContent).not.toHaveBeenCalled();
        expect(await historyModel.countDocuments({ userId: 'user-b' })).toBe(0);
    });

    it('returns the mapped AI error when content generation fails', async () => {
        aiMock.generateContent.mockResolvedValueOnce(
            ResultEntity.failure(ErrorEntity.SDKError('Gemini failed')),
        );

        const token = createAuthToken({ sub: 'user-abc' });

        const response = await api()
            .post('/api/v1/history/generate/query')
            .set('Authorization', `Bearer ${token}`)
            .send({ theme: 'fantasy' })
            .expect(500);
        const body = bodyOf<ErrorResponseBody>(response);

        expect(body).toEqual({
            code: ErrorCodes.SDKError,
            message: 'Gemini failed',
        });
        expect(await historyModel.countDocuments()).toBe(0);
    });

    it('lists only active histories for the authenticated user and requested filter', async () => {
        await historyModel.insertMany([
            {
                userId: 'user-123',
                content: 'Active fantasy history',
                theme: 'fantasy',
                character: 'Arthur',
                date: '1999-12-31',
                isActive: true,
                type: HistoryType.QUERY,
            },
            {
                userId: 'user-123',
                content: 'Inactive fantasy history',
                theme: 'fantasy',
                character: 'Arthur',
                date: '1999-12-31',
                isActive: false,
                type: HistoryType.QUERY,
            },
            {
                userId: 'user-123',
                content: 'Active sci-fi history',
                theme: 'sci-fi',
                character: 'Arthur',
                date: '1999-12-31',
                isActive: true,
                type: HistoryType.SUBSCRIPTION,
            },
            {
                userId: 'another-user',
                content: 'Another user history',
                theme: 'fantasy',
                character: 'Arthur',
                date: '1999-12-31',
                isActive: true,
                type: HistoryType.QUERY,
            },
        ]);

        const token = createAuthToken({ sub: 'user-123' });

        const response = await api()
            .get('/api/v1/history/list')
            .query({ theme: 'fantasy' })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        const body = bodyOf<GetHistoriesResponseBody>(response);

        expect(body.histories).toHaveLength(1);
        expect(body.histories[0]).toMatchObject({
            content: 'Active fantasy history',
            theme: 'fantasy',
            character: 'Arthur',
            date: '1999-12-31',
            type: HistoryType.QUERY,
        });
        expect(body.histories[0].id).toEqual(expect.any(String));
        expect(body.histories[0].generateAt).toBeDefined();
        expect(body.meta).toEqual({ page: 1, pageSize: 20, total: 1, totalPages: 1 });
    });

    it('paginates histories in deterministic generated-date and id order without crossing owners', async () => {
        const generatedAt = new Date('2026-09-08T12:00:00.000Z');
        const otherOwner = await historyModel.create({
            userId: 'other-user',
            content: 'Other owner',
            isActive: true,
            type: HistoryType.QUERY,
            generateAt: generatedAt,
        });
        const first = await historyModel.create({
            userId: 'user-123',
            content: 'First',
            isActive: true,
            type: HistoryType.QUERY,
            generateAt: generatedAt,
        });
        const second = await historyModel.create({
            userId: 'user-123',
            content: 'Second',
            isActive: true,
            type: HistoryType.QUERY,
            generateAt: generatedAt,
        });
        const newest = await historyModel.create({
            userId: 'user-123',
            content: 'Newest',
            isActive: true,
            type: HistoryType.QUERY,
            generateAt: new Date('2026-09-08T12:01:00.000Z'),
        });

        const token = createAuthToken({ sub: 'user-123' });
        const firstPage = await api()
            .get('/api/v1/history/list')
            .query({ page: 1, pageSize: 2 })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        const secondPage = await api()
            .get('/api/v1/history/list')
            .query({ page: 2, pageSize: 2 })
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        const firstBody = bodyOf<GetHistoriesResponseBody>(firstPage);
        const secondBody = bodyOf<GetHistoriesResponseBody>(secondPage);
        const expectedSameDateOrder = [first, second]
            .sort((left, right) => right._id.toHexString().localeCompare(left._id.toHexString()))
            .map((history) => history._id.toHexString());

        expect(firstBody.histories.map((history) => history.id)).toEqual([
            newest._id.toHexString(),
            expectedSameDateOrder[0],
        ]);
        expect(secondBody.histories.map((history) => history.id)).toEqual([expectedSameDateOrder[1]]);
        expect(firstBody.meta).toEqual({ page: 1, pageSize: 2, total: 3, totalPages: 2 });
        expect(secondBody.meta).toEqual({ page: 2, pageSize: 2, total: 3, totalPages: 2 });
        expect(firstBody.histories.some((history) => history.id === otherOwner._id.toHexString())).toBe(false);
    });

    it.each([
        { page: 0, pageSize: 20 },
        { page: 1, pageSize: 101 },
        { page: 'not-a-number', pageSize: 20 },
    ])('rejects an invalid pagination query %o', async (query) => {
        const token = createAuthToken({ sub: 'user-123' });

        await api()
            .get('/api/v1/history/list')
            .query(query)
            .set('Authorization', `Bearer ${token}`)
            .expect(400);
    });

    it('rejects an injected user filter and leaves another user history inaccessible', async () => {
        await historyModel.insertMany([
            {
                userId: 'user-a',
                content: 'User A history',
                isActive: true,
                type: HistoryType.QUERY,
            },
            {
                userId: 'user-b',
                content: 'User B history',
                isActive: true,
                type: HistoryType.QUERY,
            },
        ]);

        const token = createAuthToken({ sub: 'user-a' });

        await api()
            .get('/api/v1/history/list')
            .query({ userId: 'user-b' })
            .set('Authorization', `Bearer ${token}`)
            .expect(400);

        expect(await historyModel.countDocuments({ userId: 'user-b' })).toBe(1);
    });

    it('deactivates a history by id for the authenticated owner', async () => {
        const history = await historyModel.create({
            userId: 'user-123',
            content: 'History to deactivate',
            isActive: true,
            type: HistoryType.QUERY,
        });

        const token = createAuthToken({ sub: 'user-123' });
        const historyId = history._id.toHexString();

        const response = await api()
            .patch(`/api/v1/history/deactivate-by-id/${historyId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        const body = bodyOf<MessageResponseBody>(response);

        expect(body).toEqual({
            message: 'History deactivated successfully',
        });

        const updated = await historyModel.findById(historyId).lean();

        expect(updated?.isActive).toBe(false);
    });

    it('returns not found when a user tries to deactivate another user history', async () => {
        const history = await historyModel.create({
            userId: 'owner-user',
            content: 'Private history',
            isActive: true,
            type: HistoryType.QUERY,
        });

        const token = createAuthToken({ sub: 'another-user' });
        const historyId = history._id.toHexString();

        const response = await api()
            .patch(`/api/v1/history/deactivate-by-id/${historyId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);
        const body = bodyOf<ErrorResponseBody>(response);

        expect(body.code).toBe(ErrorCodes.NotFound);

        const unchanged = await historyModel.findById(historyId).lean();

        expect(unchanged?.isActive).toBe(true);
    });

    it('deactivates all active histories for the authenticated user', async () => {
        await historyModel.insertMany([
            { userId: 'user-123', content: 'One', isActive: true, type: HistoryType.QUERY },
            { userId: 'user-123', content: 'Two', isActive: true, type: HistoryType.QUERY },
            { userId: 'other-user', content: 'Other', isActive: true, type: HistoryType.QUERY },
        ]);

        const token = createAuthToken({ sub: 'user-123' });

        const response = await api()
            .patch('/api/v1/history/deactivate-by-user')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        const body = bodyOf<MessageResponseBody>(response);

        expect(body).toEqual({
            message: 'Histories deactivated successfully',
        });

        const userHistories = await historyModel.find({ userId: 'user-123' }).lean();
        const otherUserHistory = await historyModel.findOne({ userId: 'other-user' }).lean();

        expect(userHistories.every((history) => history.isActive === false)).toBe(true);
        expect(otherUserHistory?.isActive).toBe(true);
    });

    it('rejects requests without JWT', async () => {
        await api().post('/api/v1/history/generate/query').send({ theme: 'fantasy' }).expect(401);
    });

    it('rejects requests with an invalid JWT', async () => {
        await api()
            .get('/api/v1/history/list')
            .set('Authorization', 'Bearer invalid-token')
            .expect(401);
    });
});
