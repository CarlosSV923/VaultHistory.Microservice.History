import { Module } from '@nestjs/common';
import { HistoryController } from './controllers/history.controller';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { JwtStrategy } from './auth/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
    imports: [
        PassportModule.register({
            defaultStrategy: 'jwt',
        }),
    ],
    exports: [JwtStrategy, JwtAuthGuard],
    providers: [JwtStrategy, JwtAuthGuard],
    controllers: [HistoryController],
})
export class ApiModule {}
