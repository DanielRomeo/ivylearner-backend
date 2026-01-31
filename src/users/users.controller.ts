import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Request,
    forwardRef,
    Inject,
    HttpException,
    HttpStatus,
    HttpCode,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiBody,
    ApiProperty,
} from '@nestjs/swagger';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { User } from '../interfaces/user.interface';
import { UserRole } from '../database/schema';  // ← import the literal union
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod'; // Add this import
import { ZodValidationPipe } from 'nestjs-zod'; // or use built-in ValidationPipe with transform

export const CreateUserSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['student', 'instructor', 'admin'] as const).default('student'),
});

// DTO classes for Swagger documentation
class CreateUserDto extends createZodDto(CreateUserSchema) {
    @ApiProperty({ 
        example: 'john@example.com',
        description: 'User email address'
    })
    email: string;

    @ApiProperty({ 
        example: 'SecurePass123!',
        description: 'User password (min 6 characters)'
    })
    password: string;

    @ApiProperty({ 
        example: 'John',
        description: 'User first name',
        required: false
    })
    firstName?: string;

    @ApiProperty({ 
        example: 'Doe',
        description: 'User last name',
        required: false
    })
    lastName?: string;

    @ApiProperty({ 
        example: 'student',
        description: 'User role',
        enum: ['student', 'instructor', 'admin'],
        default: 'student'
    })
    role?: string;
}

class LoginDto {
    @ApiProperty({ 
        example: 'john@example.com',
        description: 'User email address'
    })
    email: string;

    @ApiProperty({ 
        example: 'SecurePass123!',
        description: 'User password'
    })
    password: string;
}

class UpdateUserDto {
    @ApiProperty({ 
        example: 'john@example.com',
        description: 'User email address',
        required: false
    })
    email?: string;

    @ApiProperty({ 
        example: 'John',
        description: 'User first name',
        required: false
    })
    firstName?: string;

    @ApiProperty({ 
        example: 'Doe',
        description: 'User last name',
        required: false
    })
    lastName?: string;

    @ApiProperty({ 
        example: 'instructor',
        description: 'User role',
        enum: ['student', 'instructor', 'admin'],
        required: false
    })
    role?: string;
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
    ) {}

    @Post('login')
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
        summary: 'User login',
        description: 'Authenticate user with email and password'
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ 
        status: 200, 
        description: 'Login successful',
        schema: {
            example: {
                statusCode: 200,
                message: 'Login successful',
                data: {
                    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    user: {
                        id: 1,
                        email: 'john@example.com',
                        role: 'student'
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Request() req) {
        console.log(req.user);
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

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ 
        summary: 'Create a new user',
        description: 'Register a new user in the system'
    })
    @ApiBody({ 
        type: CreateUserDto,
        description: 'User registration data',
        examples: {
            student: {
                summary: 'Create Student',
                value: {
                    email: 'student@example.com',
                    password: 'SecurePass123!',
                    firstName: 'John',
                    lastName: 'Doe',
                    role: 'student'
                }
            },
            instructor: {
                summary: 'Create Instructor',
                value: {
                    email: 'instructor@example.com',
                    password: 'SecurePass123!',
                    firstName: 'Jane',
                    lastName: 'Smith',
                    role: 'instructor'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 201, 
        description: 'User created successfully',
        schema: {
            example: {
                statusCode: 201,
                message: 'User created successfully',
                data: {
                    id: 1,
                    email: 'john@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    role: 'student',
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                }
            }
        }
    })
    @ApiResponse({ status: 409, description: 'Email already exists' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    async create(@Body() userData: CreateUserDto) {
        try {
            const newUser = await this.usersService.create(userData);
            if (!newUser) {
                throw new HttpException(
                    'Failed to create user',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            // Verify user was created by fetching from DB
            const createdUser = await this.usersService.findOne(newUser.email);
            if (!createdUser) {
                throw new HttpException(
                    'User creation verification failed',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            const { passwordHash, ...userWithoutPassword } = createdUser;
            return {
                statusCode: 201,
                message: 'User created successfully',
                data: userWithoutPassword,
            };
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes('UNIQUE constraint failed')
            ) {
                throw new HttpException(
                    'Email already exists',
                    HttpStatus.CONFLICT,
                );
            }
            console.error('User creation error:', error);
            throw new HttpException(
                'Failed to create user',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Get all users',
        description: 'Retrieve a list of all registered users (requires authentication)'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Users retrieved successfully',
        schema: {
            example: {
                statusCode: 200,
                message: 'Users retrieved successfully',
                data: [
                    {
                        id: 1,
                        email: 'john@example.com',
                        firstName: 'John',
                        lastName: 'Doe',
                        role: 'student'
                    }
                ]
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
    async findAll() {
        const users = await this.usersService.findAll();
        return {
            statusCode: 200,
            message: 'Users retrieved successfully',
            data: users,
        };
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Get user by ID',
        description: 'Retrieve a specific user by their ID (requires authentication)'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'User ID',
        example: 1
    })
    @ApiResponse({ 
        status: 200, 
        description: 'User found successfully',
        schema: {
            example: {
                statusCode: 200,
                message: 'User found successfully',
                data: {
                    id: 1,
                    email: 'john@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    role: 'student'
                }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const user = await this.usersService.findById(id);
        return {
            statusCode: 200,
            message: 'User found successfully',
            data: user,
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Update user',
        description: 'Update user information by ID (requires authentication)'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'User ID',
        example: 1
    })
    @ApiBody({ 
        type: UpdateUserDto,
        description: 'User update data',
        examples: {
            updateName: {
                summary: 'Update Name',
                value: {
                    firstName: 'Johnny',
                    lastName: 'Smith'
                }
            },
            updateRole: {
                summary: 'Update Role',
                value: {
                    role: 'instructor'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'User updated successfully',
        schema: {
            example: {
                statusCode: 200,
                message: 'User updated successfully',
                data: {
                    id: 1,
                    email: 'john@example.com',
                    firstName: 'Johnny',
                    lastName: 'Smith',
                    role: 'instructor'
                }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateData: UpdateUserDto,
    ) {
        const updatedUser = await this.usersService.update(id, updateData);
        return {
            statusCode: 200,
            message: 'User updated successfully',
            data: updatedUser,
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ 
        summary: 'Delete user',
        description: 'Delete a user by ID (requires authentication)'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'User ID',
        example: 1
    })
    @ApiResponse({ status: 204, description: 'User deleted successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.usersService.remove(id);
    }
}