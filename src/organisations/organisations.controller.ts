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
import { OrganisationType } from '../interfaces/organisation.interface';
import { Instructor, InstructorUser } from '../interfaces/instructor.interface';
import { OrganisationsService } from './organisations.service';
import { InstructorsService } from 'src/instructors/instructors.service';

@Controller('organisations')
export class OrganisationsController {
    constructor(
        private readonly organisationsService: OrganisationsService,
        private readonly instuctorsService: InstructorsService,
    ) {}

    // create an organisation:
    @Post('create')
    // @HttpCode(201)
    async create(@Body() organisationData: OrganisationType) {
        try {
            // first lets try to check if the passed organisationData.createcBy Id exists in the users instructors table:
            const instructorExists =
                await this.instuctorsService.findOneInstructor(
                    organisationData.createdBy,
                );
            console.log(organisationData.createdBy);
            if (!instructorExists) {
                throw new HttpException(
                    'The Instructor Id you are trying to create the organisation for, does not exist in the database!',
                    HttpStatus.INTERNAL_SERVER_ERROR, // change this status error code in future
                );
            }

            // change the 'createdBy' property. because the organisationService want the instructorId not instructor UserId
            organisationData['createdBy'] =
                await this.instuctorsService.getInstructorIdGivenInstructorUser_id(
                    organisationData.createdBy,
                );

            const newOrganisation =
                await this.organisationsService.create(organisationData);
            if (!newOrganisation) {
                throw new HttpException(
                    'Failed to create Organisation',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
            // Verify organisation was created by fetching from DB
            const createdOrganisation = await this.organisationsService.findOne(
                newOrganisation.id,
            );
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
            console.error('Organisation creation error:', error);
            throw new HttpException(
                'Failed to create organisation',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // get the first organisation that is created by the instructor id
    @Get('first/:instructorId')
    async getFirstByInstructor(@Param('instructorId') instructorId: string) {
        const organization =
            await this.organisationsService.findFirstByInstructor(
                Number(instructorId),
            );
        return (
            organization || {
                message: 'No organizations found for this instructor',
            }
        );
    }
}
