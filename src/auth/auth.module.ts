import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import {JwtStrategy} from './jwt.strategy'

@Module({
  imports: [
    UsersModule,
    PassportModule,
    PassportModule,
    JwtModule.register({
      secret: 'SECRET',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
