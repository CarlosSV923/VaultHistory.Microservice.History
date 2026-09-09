import { Module } from '@nestjs/common';
import { HistoryController } from './controllers/history.controller';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JobTokenAuthGuard } from './auth/job-token-auth.guard';
import { FrontendTokenAuthGuard } from './auth/frontend-token-auth.guard';
import { JwtStrategy } from './auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { ApplicationModule } from '@application/application.module';

@Module({
    imports: [
        PassportModule.register({
            defaultStrategy: 'jwt',
        }),
        ApplicationModule,
    ],
    exports: [JwtStrategy, JwtAuthGuard, JobTokenAuthGuard, FrontendTokenAuthGuard],
    providers: [JwtStrategy, JwtAuthGuard, JobTokenAuthGuard, FrontendTokenAuthGuard],
    controllers: [HistoryController],
})
export class ApiModule {}
