// src/auth/auth.service.ts
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    // Local (email/password) validation
    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findOne(email);

        if (!user || !user.passwordHash) return null;

        // NOTE: swap this for bcrypt.compare once you add password hashing
        const isMatch = user.passwordHash === password;
        if (!isMatch) return null;

        const { passwordHash, ...rest } = user;
        return rest;
    }

    // JWT token generation — used by both local and Google login
    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    // Google OAuth — find existing user by googleId or email, or create new one
    async findOrCreateGoogleUser(googleUser: {
        googleId: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
        googleAccessToken: string;
    }) {
        let user = await this.usersService.findByGoogleId(googleUser.googleId);

        if (!user) {
            user = await this.usersService.findOne(googleUser.email);
        }

        if (user) {
            return this.usersService.updateGoogleTokens(user.id, {
                googleId: googleUser.googleId,
                googleAccessToken: googleUser.googleAccessToken,
                avatarUrl: googleUser.avatarUrl,
            });
        }

        return this.usersService.createGoogleUser(googleUser);
    }
}