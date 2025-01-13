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
@UseGuards(JwtAuthGuard)
export class CourseController {
constructor(private readonly courseService: CourseService) {}

@Get()
async findByOrganisation(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    @Query('publishStatus') publishStatus?: 'draft' | 'published' | 'archived',
    @CurrentUser() user
) {
    return this.courseService.findByOrganisation(
    user.organisationId,
    { limit, offset, publishStatus }
    );
}

@Get(':id')
async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user
) {
    const course = await this.courseService.findOne(id);
    
    // Verify organization access
    if (course.organisationId !== user.organisationId) {
    throw new NotFoundException('Course not found');
    }
    
    return course;
}

@Post()
async create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user
) {
    // Ensure the course is created for user's organization
    if (createCourseDto.organisationId !== user.organisationId) {
    throw new BadRequestException('Invalid organisation ID');
    }

    return this.courseService.create(createCourseDto, user.id);
}

@Put(':id')
async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user
) {
    const course = await this.courseService.findOne(id);
    
    // Verify organization access
    if (course.organisationId !== user.organisationId) {
    throw new NotFoundException('Course not found');
    }

    // Prevent changing organisation ID
    if (updateCourseDto.organisationId && updateCourseDto.organisationId !== course.organisationId) {
    throw new BadRequestException('Cannot change organisation ID');
    }

    return this.courseService.update(id, updateCourseDto);
}

@Delete(':id')
async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user
) {
    const course = await this.courseService.findOne(id);
    
    // Verify organization access
    if (course.organisationId !== user.organisationId) {
    throw new NotFoundException('Course not found');
    }

    await this.courseService.remove(id);
    return { status: HttpStatus.OK, message: 'Course deleted successfully' };
}

@Put(':id/publish')
async publishCourse(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user
) {
    const course = await this.courseService.findOne(id);
    
    // Verify organization access
    if (course.organisationId !== user.organisationId) {
    throw new NotFoundException('Course not found');
    }

    return this.courseService.update(id, {
    publishStatus: 'published',
    publishedAt: new Date()
    });
}

@Put(':id/archive')
async archiveCourse(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user
) {
    const course = await this.courseService.findOne(id);
    
    // Verify organization access
    if (course.organisationId !== user.organisationId) {
    throw new NotFoundException('Course not found');
    }

    return this.courseService.update(id, {
    publishStatus: 'archived'
    });
}
}