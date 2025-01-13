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
import { NotFoundException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import {OrganisationType} from '../interfaces/organisation.interface'
import { Instructor , InstructorUser } from '../interfaces/instructor.interface';
import { OrganisationsService } from 'src/organisations/organisations.service';
import { InstructorsService } from 'src/instructors/instructors.service';
import { CoursesService } from './courses.service';
import { CourseType } from 'src/interfaces/courseType.interface';


@Controller('courses')
export class CoursesController {
    constructor(
        private readonly organisationsService: OrganisationsService,
        private readonly instuctorsService: InstructorsService,
        private readonly coursesService: CoursesService
    ) {}

    // create an organisation:
    @Post('create')
    async create(@Body() courseData: CourseType) {
        try {

            // Verify if Instructor and Organisation exitst in database:
            const instructorExists = await this.instuctorsService.findOneInstructor(courseData.createdBy);
            if (!instructorExists) {
                throw new HttpException(
                    {
                        statusCode: HttpStatus.NOT_FOUND,
                        message: `Instructor with ID ${courseData.createdBy} not found. Please check the ID and try again.`,
                        error: 'Instructor Not Found',
                    },
                    HttpStatus.NOT_FOUND,
                );
            }
            //Verify if Organisation exitst in database:
            const organisationExists = await this.organisationsService.findOne(courseData.organisationId);
            if (!organisationExists) {
                throw new HttpException(
                    'The Instructor Id you are trying to create the organisation for, does not exist in the database!',
                    HttpStatus.INTERNAL_SERVER_ERROR, // change this status error code in future
                );
            }


            // const newOrganisation = await this.organisationsService.create(organisationData);
            // if (!newOrganisation) {
            //     throw new HttpException(
            //         'Failed to create Organisation',
            //         HttpStatus.INTERNAL_SERVER_ERROR,
            //     );
            // }


            // Verify organisation was created by fetching from DB
            // const createdOrganisation = await this.organisationsService.findOne(newOrganisation.id);
            // if (!createdOrganisation) {
            //     throw new HttpException(
            //         'Organisation creation verification failed',
            //         HttpStatus.INTERNAL_SERVER_ERROR,
            //     );
            // }
            // // const { password, ...userWithoutPassword } = createdUser;
            // return {
            //     statusCode: 201,
            //     message: 'Organisation created successfully',
            //     data: {},
            // };
        } catch (error) {
            // Handle specific errors
            if (
                error instanceof Error &&
                error.message.includes('UNIQUE constraint failed')
            ) {
                throw new HttpException(
                    'Email already exists',
                    HttpStatus.CONFLICT,
                );
            }

            // error to be shown in your response object:
            throw new HttpException(
                {
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: error.message || 'An unexpected error occurred.',
                    error: 'Internal Server Error',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
