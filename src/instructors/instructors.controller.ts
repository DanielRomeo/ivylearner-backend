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
} from '@nestjs/common';

import { AuthService } from 'src/auth/auth.service';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { UseGuards } from '@nestjs/common';
import { InstructorsService } from './instructors.service';
import {Instructor} from '../interfaces/instructor.interface' // Instructor type


@Controller('instructor')
export class InstructorsController {
    constructor(
        private readonly instructorService: InstructorsService,
        @Inject(forwardRef(() => AuthService)) // for circular dependence
        private readonly authService: AuthService,
    ) {}

    @Post('create')
    @HttpCode(201)
    async create(@Body() instructorData: Instructor) {
        try {
            const newInstructor = await this.instructorService.create(instructorData);
            if (!newInstructor) {
                throw new HttpException(
                    'Failed to create instuctor.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            // Verify user was created by fetching from DB
            // const createdUser = await this.instructorService.findOne(newUser.email);
            // if (!createdUser) {
            //     throw new HttpException(
            //         'User creation verification failed',
            //         HttpStatus.INTERNAL_SERVER_ERROR,
            //     );
            // }
            // const { password, ...userWithoutPassword } = createdUser;
            // return {
            //     statusCode: 201,
            //     message: 'User created successfully',
            //     data: userWithoutPassword,
            // };
        } catch (error) {
            // Handle specific errors
            // if (
            //     error instanceof Error &&
            //     error.message.includes('UNIQUE constraint failed')
            // ) {
            //     throw new HttpException(
            //         'Email already exists',
            //         HttpStatus.CONFLICT,
            //     );
            // }
            console.error('User creation error:', error);
            // throw new HttpException(
            //     'Failed to create user',
            //     HttpStatus.INTERNAL_SERVER_ERROR,
            // );
        }
    }
}
