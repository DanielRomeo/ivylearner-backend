import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy, RefreshTokenStrategy } from './jwt.strategy';

@Module({
    imports: [
        forwardRef(() => UsersModule),
        PassportModule,
        PassportModule,
        JwtModule.register({
            secret: 'SECRET',
            signOptions: { expiresIn: '15m' },
        }),
        JwtModule.register({
            secret: 'REFRESH_TOKEN_SECRET',
            signOptions: { expiresIn: '7d' }, // Long-lived refresh token
          }),
    ],
    providers: [AuthService, JwtStrategy, RefreshTokenStrategy , LocalStrategy],
    exports: [AuthService],
})
export class AuthModule {}
