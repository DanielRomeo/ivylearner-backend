// src/auth/auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy, RefreshTokenStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';

@Module({
    imports: [
        forwardRef(() => UsersModule),
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'SECRET',
            signOptions: { expiresIn: '15m' },
        }),
    ],
    providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        RefreshTokenStrategy,
        GoogleStrategy,
    ],
    controllers: [AuthController],
    exports: [AuthService, JwtModule],
})
export class AuthModule {}