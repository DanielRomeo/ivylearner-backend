// src/auth/auth.controller.ts
import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    // POST /api/auth/login
    @Post('login')
    @UseGuards(AuthGuard('local'))
    @ApiOperation({ summary: 'Login with email and password' })
    async login(@Req() req: any) {
        return this.authService.login(req.user);
    }

    // GET /api/auth/google — redirects to Google consent screen
    @Get('google')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Initiate Google OAuth login' })
    googleLogin() {
        // Passport handles the redirect
    }

    // GET /api/auth/google/callback — Google redirects here after consent
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Google OAuth callback' })
    async googleCallback(@Req() req: any, @Res() res: Response) {
        const { access_token } = await this.authService.login(req.user);
        const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/auth/callback?token=${access_token}`);
    }
}