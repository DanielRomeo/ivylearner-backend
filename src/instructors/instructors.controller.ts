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
import {Instructor, InstructorUser} from '../interfaces/instructor.interface' // Instructor type
import {User} from '../interfaces/user.interface'
import { UsersService } from 'src/users/users.service';


@Controller('instructors')
export class InstructorsController {
    constructor(
        private readonly usersService: UsersService,
        private readonly instructorService: InstructorsService,
        @Inject(forwardRef(() => AuthService)) // for circular dependence
        private readonly authService: AuthService,
    ) {}

    @Post('create')
    @HttpCode(201)
    async create(@Body() instructorDataRecieved: InstructorUser) {
        // Extract userData from the instructorData object:
        let {email, password} = instructorDataRecieved;

        let instructorDataPure: InstructorUser = {
            userId: null,
            email: null,
            password: null,
            firstName: instructorDataRecieved.firstName,
            lastName: instructorDataRecieved.lastName
        }

        try {
            // first create a user:
            const newUser = await this.usersService.create({email, password});
            if (!newUser) {
                throw new HttpException(
                    'Failed to create user 1111',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            // verify if user was created and then create an instuctor:
            const createdUser = await this.usersService.findOne(newUser.email);
            if (!createdUser) {
                throw new HttpException(
                    'User creation verification failed',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            // append the data gotten from user with data in the database(userId)
            instructorDataPure.userId = createdUser.id;
            instructorDataPure.email = createdUser.email;
            instructorDataPure.password = createdUser.password;

            const createdInstructor = await this.instructorService.create(instructorDataPure);
            if (!createdInstructor) {
                throw new HttpException(
                    'Failed to create instuctor.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            // Verify user was created by fetching from DB
            const verifiedCreatedInstructor = await this.instructorService['findOne'](instructorDataPure.userId);
            if (!verifiedCreatedInstructor) {
                throw new HttpException(
                    'Instructor creation verification failed',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
            return {
                statusCode: 201,
                message: 'Instructor created successfully',
                data: {...verifiedCreatedInstructor, email: instructorDataPure.email}
            };
            

        } catch (error) {
            //Handle specific errors
            if (
                error instanceof Error &&
                error.message.includes('UNIQUE constraint failed')
            ) {
                throw new HttpException(
                    'Email already exists',
                    HttpStatus.CONFLICT,
                );
            }
            console.error('Instructor creation error:', error);
            throw new HttpException(
                'Failed to create user',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // get an instructor:

    // controller to delete an instructor:

    // controller to update an instructor:

    // constroller to get an instructor:

    
}
