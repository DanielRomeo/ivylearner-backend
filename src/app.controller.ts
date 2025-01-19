import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
    constructor(private readonly authService: AuthService) {}

    // Login route using LocalAuthGuard (for username/password authentication)
    // @UseGuards(LocalAuthGuard)
    // @Post('login')
    // login(@Request() req): any {
    //     return this.authService.login(req.user);
    // }

    // Protected route using JwtAuthGuard
    @UseGuards(JwtAuthGuard)
    @Get('protected')
    getProtected(@Request() req): any {
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Get('auth/me')
    authenticateUser(@Request() req): any {
        return req.user;
    }
}
