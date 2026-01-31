import {
    Controller,
    Get,
    Post,
    UseGuards,
    Request,
    ParseIntPipe,
    Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AuthService } from './auth/auth.service';

@ApiTags('App')
@Controller()
export class AppController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Health check' })
    @ApiResponse({ status: 200, description: 'API is running' })
    getHello(): any {
        return {
            statusCode: 200,
            message: 'IvyLearner API is running',
            version: '2.0',
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('protected')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Protected route test' })
    @ApiResponse({ status: 200, description: 'Returns user from JWT' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    getProtected(@Request() req): any {
        return {
            statusCode: 200,
            message: 'You are authorized',
            data: req.user,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('auth/me')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get current authenticated user' })
    @ApiResponse({ status: 200, description: 'Returns current user' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    authenticateUser(@Request() req): any {
        return {
            statusCode: 200,
            message: 'User retrieved successfully',
            data: req.user,
        };
    }
}