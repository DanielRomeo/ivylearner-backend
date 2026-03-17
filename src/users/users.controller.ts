// src/users/users.controller.ts
import {
    Controller, Get, Post, Body, Put, Param, Delete,
    Request, forwardRef, Inject, HttpException, HttpStatus,
    HttpCode, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import {
    ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
    ApiParam, ApiBody, ApiProperty,
} from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';

class CreateUserDto {
    @ApiProperty({ example: 'john@example.com' })
    @IsEmail({}, { message: 'Invalid email format' })
    email!: string;

    @ApiProperty({ example: 'SecurePass123!' })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password!: string;

    @ApiProperty({ example: 'John', required: false })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({ example: 'Doe', required: false })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ example: 'student', enum: ['student', 'instructor', 'admin'], required: false })
    @IsOptional()
    @IsEnum(['student', 'instructor', 'admin'])
    role?: 'student' | 'instructor' | 'admin';
}

class LoginDto {
    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'SecurePass123!' })
    @IsString()
    password!: string;
}

class UpdateUserDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ enum: ['student', 'instructor', 'admin'], required: false })
    @IsOptional()
    @IsEnum(['student', 'instructor', 'admin'])
    role?: 'student' | 'instructor' | 'admin';
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
    ) {}

    // POST /api/users/login
    @Post('login')
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiBody({ type: LoginDto })
    async login(@Request() req: any) {
        const accessToken = await this.authService.login(req.user);
        return {
            statusCode: 200,
            message: 'Login successful',
            data: {
                access_token: accessToken['access_token'],
                user: {
                    id: req.user.id,
                    email: req.user.email,
                    role: req.user.role,
                },
            },
        };
    }

    // GET /api/users/me
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getCurrentUser(@Request() req: any) {
        const user = await this.usersService.findById(req.user.id);
        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        // FIX: destructure passwordHash (not 'password' — column was renamed)
        const { passwordHash, ...userWithoutPassword } = user;
        return {
            statusCode: 200,
            data: userWithoutPassword,
        };
    }

    // PUT /api/users/me
    @UseGuards(JwtAuthGuard)
    @Put('me')
    async updateMe(
        @Request() req: any,
        @Body() body: { firstName?: string; lastName?: string; bio?: string },
    ) {
        return this.usersService.updateMe(req.user.id, body);
    }

    // POST /api/users/create
    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: CreateUserDto })
    async create(@Body() userData: CreateUserDto) {
        try {
            const newUser = await this.usersService.create({
                email: userData.email,
                password: userData.password,
                role: userData.role ?? 'student',
            });

            if (!newUser) throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);

            const createdUser = await this.usersService.findOne(newUser.email);
            if (!createdUser) throw new HttpException('User creation verification failed', HttpStatus.INTERNAL_SERVER_ERROR);

            // FIX: only destructure passwordHash
            const { passwordHash, ...userWithoutPassword } = createdUser;
            return {
                statusCode: 201,
                message: 'User created successfully',
                data: userWithoutPassword,
            };
        } catch (error) {
            if (error instanceof Error && error.message.includes('unique constraint')) {
                throw new HttpException('Email already exists', HttpStatus.CONFLICT);
            }
            console.error('User creation error:', error);
            throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET /api/users
    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get all users' })
    async findAll() {
        const users = await this.usersService.findAll();
        return { statusCode: 200, message: 'Users retrieved successfully', data: users };
    }

    // GET /api/users/:id
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({ name: 'id', type: 'number' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const user = await this.usersService.findById(id);
        return { statusCode: 200, message: 'User found successfully', data: user };
    }

    // PUT /api/users/:id
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update user' })
    @ApiParam({ name: 'id', type: 'number' })
    @ApiBody({ type: UpdateUserDto })
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateData: UpdateUserDto) {
        const updatedUser = await this.usersService.update(id, updateData);
        return { statusCode: 200, message: 'User updated successfully', data: updatedUser };
    }

    // DELETE /api/users/:id
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete user' })
    @ApiParam({ name: 'id', type: 'number' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.usersService.remove(id);
    }
}