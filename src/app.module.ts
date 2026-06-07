import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from '@api/filters/global-exception.filter';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { ApplicationModule } from '@application/application.module';
import { ApiModule } from '@api/api.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: [`config/.env.${process.env.NODE_ENV}`],
            isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.MONGO_URI!),
        InfrastructureModule,
        ApplicationModule,
        ApiModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
    ],
})
export class AppModule {}
