import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const isSwaggerEnabled = process.env.SWAGGER_ENABLED === 'true';

    if (!isProduction && isSwaggerEnabled) {
        logger.log('Setting up Swagger documentation');
        const swaggerConfig = new DocumentBuilder()
            .setTitle('Vault History API')
            .setDescription('History microservice API')
            .setVersion('1.0')
            .addTag('History')
            .build();

        const document = SwaggerModule.createDocument(app, swaggerConfig);

        SwaggerModule.setup('docs/v1', app, document);
    }

    const port = process.env.PORT || 3000;
    logger.log('Starting application - listening on port ' + port);
    await app.listen(port);
}

void bootstrap();
