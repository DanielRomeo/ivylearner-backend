// src/auth/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private authService: AuthService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ): Promise<any> {
        const { id, name, emails, photos } = profile;

        const googleUser = {
            googleId: id,
            email: emails?.[0]?.value ?? '',
            firstName: name?.givenName ?? '',
            lastName: name?.familyName ?? '',
            avatarUrl: photos?.[0]?.value ?? '',
            googleAccessToken: accessToken,
        };

        const user = await this.authService.findOrCreateGoogleUser(googleUser);
        done(null, user);
    }
}