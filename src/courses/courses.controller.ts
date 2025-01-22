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
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import {OrganisationType} from '../interfaces/organisation.interface'
import { Instructor , InstructorUser } from '../interfaces/instructor.interface';
import { OrganisationsService } from 'src/organisations/organisations.service';
import { InstructorsService } from 'src/instructors/instructors.service';
// import { CoursesService } from './courses.service';
import { CourseType } from 'src/interfaces/courseType.interface';

import {CurrentUser} from '../decorators/current-user.decorators'

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
// @UseGuards(JwtAuthGuard)
export class CoursesController {
constructor(private readonly coursesService: CoursesService,
    private readonly organisationsService : OrganisationsService,
    private readonly instructorsService : InstructorsService
) {}


// @Get()
// async findByOrganisation(
//     @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
//     @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
//     @Query('publishStatus') publishStatus?: 'draft' | 'published' | 'archived',
//     @CurrentUser() user
// ) {
//     return this.courseService.findByOrganisation(
//     user.organisationId,
//     { limit, offset, publishStatus }
//     );
// }

@Get(':id')
async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user
) {
    const course = await this.coursesService.findOne(id);
    
    // Verify organization access
    if (course.organisationId !== user.organisationId) {
    throw new NotFoundException('Course not found');
    }
    
    return course;
}



@Post('create')
@UseGuards(JwtAuthGuard)
async create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() instructor
) {
    try {
        // First verify that the organization exists and was created by this instructor
        const organization = await this.organisationsService.findOne(createCourseDto.organisationId);
        
        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        // get the instructorId, given the instructorUser_id
        // here, since we have some playing around with the user id and the isntructor id, we just convert the instructorUser Id, and get the instructor Id, coz thats whats required to make comparisons
        const  instructorInformation = await this.instructorsService.getInstructorIdGivenInstructorUser_id(instructor.id);
        if(instructorInformation){
            console.log(instructorInformation)

        }

        if (organization.createdBy !== instructorInformation.id) {
            throw new BadRequestException('You can only create courses for organizations you created');
        }

        // If we get here, the instructor is authorized to create the course
        const courseCreated = await this.coursesService.create({
            ...createCourseDto,
            createdBy: instructor.id,
            publishStatus: 'draft',
            lastUpdated: new Date(),
            rating: 0,
            enrollmentCount: 0
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
            data: courseCreated
        };

    } catch (error) {
        if (error instanceof NotFoundException || error instanceof BadRequestException) {
            throw error;
        }
        
        throw new InternalServerErrorException('Failed to create course');
    }
}
}



// @Put(':id')
// async update(
//     @Param('id', ParseIntPipe) id: number,
//     @Body() updateCourseDto: UpdateCourseDto,
//     @CurrentUser() user
// ) {
//     const course = await this.courseService.findOne(id);
    
//     // Verify organization access
//     if (course.organisationId !== user.organisationId) {
//     throw new NotFoundException('Course not found');
//     }

//     // Prevent changing organisation ID
//     if (updateCourseDto.organisationId && updateCourseDto.organisationId !== course.organisationId) {
//     throw new BadRequestException('Cannot change organisation ID');
//     }

//     return this.courseService.update(id, updateCourseDto);
// }

// @Delete(':id')
// async remove(
//     @Param('id', ParseIntPipe) id: number,
//     @CurrentUser() user
// ) {
//     const course = await this.courseService.findOne(id);
    
//     // Verify organization access
//     if (course.organisationId !== user.organisationId) {
//     throw new NotFoundException('Course not found');
//     }

//     await this.courseService.remove(id);
//     return { status: HttpStatus.OK, message: 'Course deleted successfully' };
// }

// @Put(':id/publish')
// async publishCourse(
//     @Param('id', ParseIntPipe) id: number,
//     @CurrentUser() user
// ) {
//     const course = await this.courseService.findOne(id);
    
//     // Verify organization access
//     if (course.organisationId !== user.organisationId) {
//     throw new NotFoundException('Course not found');
//     }

//     return this.courseService.update(id, {
//     publishStatus: 'published',
//     publishedAt: new Date()
//     });
// }

// @Put(':id/archive')
// async archiveCourse(
//     @Param('id', ParseIntPipe) id: number,
//     @CurrentUser() user
// ) {
//     const course = await this.courseService.findOne(id);
    
//     // Verify organization access
//     if (course.organisationId !== user.organisationId) {
//     throw new NotFoundException('Course not found');
//     }

//     return this.courseService.update(id, {
//     publishStatus: 'archived'
//     });
// }
// }