import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpStatus,
    ParseIntPipe,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
    HttpException,
    Req,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { OrganisationType } from '../interfaces/organisation.interface';
import { Instructor, InstructorUser } from '../interfaces/instructor.interface';
import { OrganisationsService } from 'src/organisations/organisations.service';
import { InstructorsService } from 'src/instructors/instructors.service';
// import { CoursesService } from './courses.service';
import { CourseType } from 'src/interfaces/courseType.interface';
import { CurrentUser } from '../decorators/current-user.decorators';
import { CoursesService, CreateCourseDto } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Define query parameters interface
interface CourseQueryParams {
    limit?: number;
    offset?: number;
    publishStatus?: 'draft' | 'published' | 'archived';
}

// Define update DTO
interface UpdateCourseDto extends Partial<CreateCourseDto> {
    publishStatus?: 'draft' | 'published' | 'archived';
}

@Controller('courses')
export class CoursesController {
    constructor(
        private readonly coursesService: CoursesService,
        private readonly organisationsService: OrganisationsService,
        private readonly instructorsService: InstructorsService,
    ) {}

    // find courses owned by an instructor:
    @Get('mycourses')
    @UseGuards(JwtAuthGuard)
    async findCourses(
        @CurrentUser() instructor,
        @Req() req,
        @Query('limit', new ParseIntPipe({ optional: true })) limit = 10, // Default limit to 10
        @Query('offset', new ParseIntPipe({ optional: true })) offset = 0, // Default offset to 0
    ) {
        try {
            // Convert instructor user ID to the instructor ID
            const instructorId = await this.instructorsService.getInstructorIdGivenInstructorUser_id(instructor.id);
            // console.log(instructor)
            if (!instructorId) {
                throw new NotFoundException('Instructor not found');
            }

            // Fetch courses owned by the instructor
            const courses = await this.coursesService.findCoursesByInstructorId(instructor.id, { limit, offset });

            return {
                statusCode: 200,
                message: 'Courses retrieved successfully',
                data: courses,
            };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to retrieve courses');
        }
    }
    

    // Get a single course
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getCourse(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user
    ) {
        try {
            const course = await this.coursesService.findOne(id);

            // Optional: Verify access to the course if needed
            // if (course.organisationId !== user.organisationId) {
            //     throw new NotFoundException('Course not found');
            // }

            return {
                statusCode: 200,
                message: 'Course retrieved successfully',
                data: course,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to retrieve course');
        }
    }

    // Edit a course
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async editCourse(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCourseDto: UpdateCourseDto,
        @CurrentUser() instructor
    ) {
        try {
            const updatedCourse = await this.coursesService.updateCourse(id, {
                ...updateCourseDto,
                lastUpdated: new Date(),
            });

            return {
                statusCode: 200,
                message: 'Course updated successfully',
                data: updatedCourse,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update course');
        }
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
        const course = await this.coursesService.findOne(id);

        // Verify organization access
        // if (course.organisationId !== user.organisationId) {
        // throw new NotFoundException('Course not found');
        // }

        return course;
    }

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async create(
        @Body() createCourseDto: CreateCourseDto,
        @CurrentUser() instructor,
    ) {
        try {
            // First verify that the organization exists and was created by this instructor
            const organization = await this.organisationsService.findOne(
                createCourseDto.organisationId,
            );

            if (!organization) {
                throw new NotFoundException('Organization not found');
            }

            // get the instructorId, given the instructorUser_id
            // here, since we have some playing around with the user id and the isntructor id, we just convert the instructorUser Id, and get the instructor Id, coz thats whats required to make comparisons
            const instructorId =
                await this.instructorsService.getInstructorIdGivenInstructorUser_id(
                    instructor.id,
                );
            if (instructorId) {
                console.log(instructorId);
            }

            if (organization.createdBy !== instructorId) {
                throw new BadRequestException(
                    'You can only create courses for organizations you created',
                );
            }

            // If we get here, the instructor is authorized to create the course
            const courseCreated = await this.coursesService.create({
                ...createCourseDto,
                createdBy: instructor.id,
                publishStatus: 'draft',
                lastUpdated: new Date(),
                rating: 0,
                enrollmentCount: 0,
            });
            if (!courseCreated) {
                throw new HttpException(
                    'Failed to create course.',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }

            return {
                statusCode: 201,
                message: 'Course created successfully',
                data: courseCreated,
            };
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to create course');
        }
    }
}
