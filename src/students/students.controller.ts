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
    ParseIntPipe,
    NotFoundException
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentUser } from 'src/interfaces/student.interface';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService,
        private readonly usersService: UsersService,
        @Inject(forwardRef(() => AuthService)) // for circular dependence
        private readonly authService: AuthService,
    ) {}

    @Get()
    async findAll() {
        try {
            console.log('we got passed this phase');
            return this.studentsService.getAllStudents();
        } catch (error) {
            console.error('Error fetching students:', error);
            throw error; // or handle appropriately
        }
    }

    // Controller to create a student:
    @Post('create')
    // @HttpCode(201)
    async create(@Body() studentDataReceived: StudentUser) {
        let {email, password} = studentDataReceived;

        let studentDataPure: StudentUser = {
            userId: null,
            email: null,
            password: null,
            firstName: studentDataReceived.firstName,
            lastName: studentDataReceived.lastName
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

            // verify if user was created and then create an student:
            const createdUser = await this.usersService.findOne(newUser.email);
            if (!createdUser) {
                throw new HttpException(
                    'User creation verification failed',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            // append the data gotten from user with data in the database(userId)
            studentDataPure.userId = createdUser.id;
            studentDataPure.email = createdUser.email;
            studentDataPure.password = createdUser.password;

            const createdStudent = await this.studentsService.create(studentDataPure);
            if (!createdStudent) {
                throw new HttpException(
                    'Failed to create student.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            // Verify user was created by fetching from DB
            const verifiedCreatedStuden = await this.studentsService['findOne'](studentDataPure.userId);
            if (!verifiedCreatedStuden) {
                throw new HttpException(
                    'Student creation verification failed',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
            return {
                statusCode: 201,
                message: 'Student created successfully',
                data: {...verifiedCreatedStuden, email: studentDataPure.email}
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
            console.error('Student creation error:', error);
            throw new HttpException(
                'Failed to create user',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Controller to delete a student:

    // Controller to update a student:

    // Controller to get a student:

    // Controller to get all students enrolled to a course:

    // Controller to unenroll a student from a course: // This means I am going to have to create a linker table::::

    // Controller to enroll to a course:
}
