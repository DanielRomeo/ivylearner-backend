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
import { InstructorsService } from 'src/instructors/instructors.service';
import { AuthService } from 'src/auth/auth.service';
import {OrganisationType} from '../interfaces/organisation.interface'
import { Instructor , InstructorUser } from '../interfaces/instructor.interface';



@Controller('organisations')
export class OrganisationsController {
    constructor(
        private readonly instructorsService: InstructorsService,
    ) {}


    // create an organisation:
    @Post('create')
    // @HttpCode(201)
    async create(@Body() organisationData: OrganisationType) {
        try {
            const newOrganisation = await this.organisationsService.create(organisationData, wait);
            if (!newOrganisation) {
                throw new HttpException(
                    'Failed to create Organisation',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
            // Verify organisation was created by fetching from DB
            const createdOrganisation = await this.organisationService.findOne(newOrganisation.id);
            if (!createdOrganisation) {
                throw new HttpException(
                    'Organisation creation verification failed',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
            // const { password, ...userWithoutPassword } = createdUser;
            return {
                statusCode: 201,
                message: 'Organisation created successfully',
                data: {},
            };
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
            console.error('User creation error:', error);
            throw new HttpException(
                'Failed to create user',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
