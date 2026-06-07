import { type INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { type MongoMemoryServer } from 'mongodb-memory-server';
import { type Model } from 'mongoose';
import request, { type Response } from 'supertest';
import { type App } from 'supertest/types';
import { ErrorCodes, ErrorEntity } from '../../src/domain/abstractions/error.entity';
import { ResultEntity } from '../../src/domain/abstractions/result.entity';
import { History, type HistoryDocument } from '../../src/infrastructure/database/history.model';
import { createAuthToken } from './auth.helper';
import { createIntegrationApp } from './test-app.factory';

type GenerateHistoryResponseBody = {
    history: string;
};

type ErrorResponseBody = {
    code: ErrorCodes;
    message: string;
};

type HistoryResponseBody = {
    id: string;
    content: string;
    date?: string;
    theme?: string;
    character?: string;
    generateAt: string;
};

type GetHistoriesResponseBody = {
    histories: HistoryResponseBody[];
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
    let aiMock: {
        generateContent: jest.Mock;
    };

    beforeAll(async () => {
        const setup = await createIntegrationApp();

        app = setup.app;
        mongo = setup.mongo;
        aiMock = setup.aiMock;
        historyModel = app.get<Model<HistoryDocument>>(getModelToken(History.name));
    });

    afterEach(async () => {
        await historyModel.deleteMany({});
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

    it('generates a history and persists it for the authenticated user', async () => {
        const token = createAuthToken({ sub: 'user-abc' });

        const response = await api()
            .post('/api/v1/history/generate')
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
        });

        const saved = await historyModel.findOne({ userId: 'user-abc' }).lean();

        expect(saved).toMatchObject({
            userId: 'user-abc',
            content: 'Generated integration history',
            date: '1999-12-31',
            theme: 'medieval fantasy',
            character: 'Arthur',
            isActive: true,
        });
    });

    it('returns the mapped AI error when content generation fails', async () => {
        aiMock.generateContent.mockResolvedValueOnce(
            ResultEntity.failure(ErrorEntity.SDKError('Gemini failed')),
        );

        const token = createAuthToken({ sub: 'user-abc' });

        const response = await api()
            .post('/api/v1/history/generate')
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
            },
            {
                userId: 'user-123',
                content: 'Inactive fantasy history',
                theme: 'fantasy',
                character: 'Arthur',
                date: '1999-12-31',
                isActive: false,
            },
            {
                userId: 'user-123',
                content: 'Active sci-fi history',
                theme: 'sci-fi',
                character: 'Arthur',
                date: '1999-12-31',
                isActive: true,
            },
            {
                userId: 'another-user',
                content: 'Another user history',
                theme: 'fantasy',
                character: 'Arthur',
                date: '1999-12-31',
                isActive: true,
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
        });
        expect(body.histories[0].id).toEqual(expect.any(String));
        expect(body.histories[0].generateAt).toBeDefined();
    });

    it('deactivates a history by id for the authenticated owner', async () => {
        const history = await historyModel.create({
            userId: 'user-123',
            content: 'History to deactivate',
            isActive: true,
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
            { userId: 'user-123', content: 'One', isActive: true },
            { userId: 'user-123', content: 'Two', isActive: true },
            { userId: 'other-user', content: 'Other', isActive: true },
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
        await api().post('/api/v1/history/generate').send({ theme: 'fantasy' }).expect(401);
    });

    it('rejects requests with an invalid JWT', async () => {
        await api()
            .get('/api/v1/history/list')
            .set('Authorization', 'Bearer invalid-token')
            .expect(401);
    });
});
