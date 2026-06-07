import { type INestApplication, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { AppModule as NestAppModule } from '../../src/app.module';
import { ResultEntity } from '../../src/domain/abstractions/result.entity';
import { AIServicePortToken } from '../../src/domain/histories/ports/ai-service.port';

export type IntegrationAppSetup = {
    app: INestApplication;
    mongo: MongoMemoryServer;
    aiMock: {
        generateContent: jest.Mock;
    };
};

export async function createIntegrationApp(): Promise<IntegrationAppSetup> {
    const mongo = await MongoMemoryServer.create();

    process.env.NODE_ENV = 'test';
    process.env.MONGO_URI = mongo.getUri();
    process.env.JWT_SECRET = 'integration-secret';
    process.env.JWT_ISSUER = 'vault-history-test';
    process.env.JWT_AUDIENCE = 'vault-history-users';
    process.env.SWAGGER_ENABLE = 'false';

    // AppModule reads process.env.MONGO_URI in its module decorator, so load it after env setup.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { AppModule } = require('../../src/app.module') as { AppModule: typeof NestAppModule };

    const aiMock = {
        generateContent: jest
            .fn()
            .mockResolvedValue(ResultEntity.success('Generated integration history')),
    };

    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider(AIServicePortToken)
        .useValue(aiMock)
        .compile();

    const app = moduleRef.createNestApplication();

    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    await app.init();

    return { app, mongo, aiMock };
}
