import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    UseGuards,
    HttpCode,
    HttpStatus,
    Request,
    // Type,
    
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiBody,
    ApiProperty,
} from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt, IsNumber, IsEnum } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { Type } from 'class-transformer';

// ============================================================================
// DTOs
// ============================================================================

class CreateCourseDto {
    @ApiProperty({ 
        example: 1,
        description: 'Organization ID'
    })
    @Type(() => Number) // Add this to ensure the value is transformed to a number
    @IsInt()
    organizationId!: number;

    @ApiProperty({ 
        example: 'Introduction to Web Development',
        description: 'Course title'
    })
    @IsString()
    title!: string;

    @ApiProperty({ 
        example: 'intro-to-web-dev',
        description: 'URL-friendly slug (auto-generated if not provided)',
        required: false
    })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiProperty({ 
        example: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript',
        description: 'Short course description',
        required: false
    })
    @IsOptional()
    @IsString()
    shortDescription?: string;

    @ApiProperty({ 
        example: 'This comprehensive course covers...',
        description: 'Full course description',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ 
        example: 99.99,
        description: 'Course price (0 for free)',
        required: false,
        default: 0
    })
    @IsOptional()
    @IsNumber()
    price?: number;

    @ApiProperty({ 
        example: 'https://example.com/thumbnail.jpg',
        description: 'Course thumbnail URL',
        required: false
    })
    @IsOptional()
    @IsString()
    thumbnailUrl?: string;

    @ApiProperty({ 
        example: 8,
        description: 'Course duration in weeks',
        required: false
    })
    @IsOptional()
    @IsInt()
    durationWeeks?: number;

    @ApiProperty({ 
        example: 'English',
        description: 'Course language',
        required: false,
        default: 'English'
    })
    @IsOptional()
    @IsString()
    language?: string;

    @ApiProperty({ 
        example: false,
        description: 'Is course published',
        required: false,
        default: false
    })
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}

class UpdateCourseDto {
    @ApiProperty({ 
        example: 'Updated Course Title',
        description: 'Course title',
        required: false
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({ 
        example: 'Updated short description',
        description: 'Short course description',
        required: false
    })
    @IsOptional()
    @IsString()
    shortDescription?: string;

    @ApiProperty({ 
        example: 'Updated full description',
        description: 'Full course description',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ 
        example: 149.99,
        description: 'Course price',
        required: false
    })
    @IsOptional()
    @IsNumber()
    price?: number;

    @ApiProperty({ 
        example: 'https://example.com/new-thumbnail.jpg',
        description: 'Course thumbnail URL',
        required: false
    })
    @IsOptional()
    @IsString()
    thumbnailUrl?: string;

    @ApiProperty({ 
        example: 12,
        description: 'Course duration in weeks',
        required: false
    })
    @IsOptional()
    @IsInt()
    durationWeeks?: number;

    @ApiProperty({ 
        example: true,
        description: 'Is course published',
        required: false
    })
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;
}

class AddInstructorDto {
    @ApiProperty({ 
        example: 5,
        description: 'User ID to add as instructor'
    })
    @IsInt()
    userId!: number;

    @ApiProperty({ 
        example: 'co_instructor',
        description: 'Instructor role in course',
        enum: ['primary', 'co_instructor', 'ta'],
        default: 'co_instructor'
    })
    @IsOptional()
    @IsEnum(['primary', 'co_instructor', 'ta'])
    role?: 'primary' | 'co_instructor' | 'ta';
}

class UpdateInstructorRoleDto {
    @ApiProperty({ 
        example: 'primary',
        description: 'New role for the instructor',
        enum: ['primary', 'co_instructor', 'ta']
    })
    @IsEnum(['primary', 'co_instructor', 'ta'])
    role!: 'primary' | 'co_instructor' | 'ta';
}

// ============================================================================
// CONTROLLER
// ============================================================================

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}

    // ========================================================================
    // COURSE CRUD
    // ========================================================================

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ 
        summary: 'Create a new course',
        description: 'Create a new course in an organization. User must be an instructor, admin, or owner of the organization.'
    })
    @ApiBody({ type: CreateCourseDto })
    @ApiResponse({ 
        status: 201, 
        description: 'Course created successfully',
        schema: {
            example: {
                statusCode: 201,
                message: 'Course created successfully',
                data: {
                    id: 1,
                    organizationId: 1,
                    title: 'Introduction to Web Development',
                    slug: 'intro-to-web-dev',
                    price: 99.99,
                    isPublished: false,
                    createdByUserId: 1,
                    createdAt: '2024-01-01T00:00:00.000Z'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not an organization member with required role' })
    @ApiResponse({ status: 404, description: 'Organization not found' })
    
    

    async create(@Body() createDto: CreateCourseDto, @Request() req) {
        console.log("Received request to create course with data:", createDto); // Debug log
        const course = await this.coursesService.create({
            ...createDto,
            createdByUserId: req.user.id,
        });

        return {
            statusCode: 201,
            message: 'Course created successfully',
            data: course,
        };
    }

    @Get()
    @ApiOperation({ 
        summary: 'Get all courses',
        description: 'Retrieve all courses, optionally filtered by organization or published status'
    })
    @ApiQuery({ 
        name: 'organizationId', 
        required: false, 
        type: 'number',
        description: 'Filter by organization ID'
    })
    @ApiQuery({ 
        name: 'published', 
        required: false, 
        type: 'boolean',
        description: 'Filter by published status'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Courses retrieved successfully',
        schema: {
            example: {
                statusCode: 200,
                message: 'Courses retrieved successfully',
                data: [
                    {
                        id: 1,
                        title: 'Introduction to Web Development',
                        slug: 'intro-to-web-dev',
                        shortDescription: 'Learn web development basics',
                        price: 99.99,
                        isPublished: true
                    }
                ]
            }
        }
    })
    async findAll(
        @Query('organizationId') organizationId?: number,
        @Query('published') published?: boolean
    ) {
        let courses;

        if (published === true) {
            courses = await this.coursesService.findPublished(organizationId);
        } else {
            courses = await this.coursesService.findAll(organizationId);
        }

        return {
            statusCode: 200,
            message: 'Courses retrieved successfully',
            data: courses,
        };
    }

    @Get('my-courses')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Get my courses',
        description: 'Get all courses where the authenticated user is an instructor'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'My courses retrieved successfully'
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getMyCourses(@Request() req) {
        const courses = await this.coursesService.findByInstructor(req.user.id);
        return {
            statusCode: 200,
            message: 'My courses retrieved successfully',
            data: courses,
        };
    }

    @Get(':id')
    @ApiOperation({ 
        summary: 'Get course by ID',
        description: 'Retrieve a specific course by ID'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'Course ID',
        example: 1
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Course found successfully'
    })
    @ApiResponse({ status: 404, description: 'Course not found' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const course = await this.coursesService.findById(id);
        return {
            statusCode: 200,
            message: 'Course found successfully',
            data: course,
        };
    }

    @Get('slug/:slug')
    @ApiOperation({ 
        summary: 'Get course by slug',
        description: 'Retrieve a specific course by its URL slug'
    })
    @ApiParam({ 
        name: 'slug', 
        type: 'string', 
        description: 'Course slug',
        example: 'intro-to-web-dev'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Course found successfully'
    })
    @ApiResponse({ status: 404, description: 'Course not found' })
    async findBySlug(@Param('slug') slug: string) {
        const course = await this.coursesService.findBySlug(slug);
        return {
            statusCode: 200,
            message: 'Course found successfully',
            data: course,
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Update course',
        description: 'Update course details (requires authentication)'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'Course ID'
    })
    @ApiBody({ type: UpdateCourseDto })
    @ApiResponse({ 
        status: 200, 
        description: 'Course updated successfully'
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Course not found' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateCourseDto
    ) {
        const course = await this.coursesService.update(id, updateDto);
        return {
            statusCode: 200,
            message: 'Course updated successfully',
            data: course,
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ 
        summary: 'Delete course',
        description: 'Delete a course (requires authentication)'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'Course ID'
    })
    @ApiResponse({ status: 204, description: 'Course deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Course not found' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.coursesService.remove(id);
    }

    // ========================================================================
    // INSTRUCTOR MANAGEMENT
    // ========================================================================

    @Post(':id/instructors')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ 
        summary: 'Add instructor to course',
        description: 'Add a new instructor to the course. User must be an instructor in the organization.'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'Course ID'
    })
    @ApiBody({ type: AddInstructorDto })
    @ApiResponse({ 
        status: 201, 
        description: 'Instructor added successfully'
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'User is not an instructor in the organization' })
    @ApiResponse({ status: 404, description: 'Course or user not found' })
    @ApiResponse({ status: 409, description: 'User is already an instructor for this course' })
    async addInstructor(
        @Param('id', ParseIntPipe) id: number,
        @Body() addInstructorDto: AddInstructorDto
    ) {
        const instructor = await this.coursesService.addInstructor(
            id,
            addInstructorDto.userId,
            addInstructorDto.role
        );

        return {
            statusCode: 201,
            message: 'Instructor added successfully',
            data: instructor,
        };
    }

    @Get(':id/instructors')
    @ApiOperation({ 
        summary: 'Get course instructors',
        description: 'Get all instructors for the course'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'Course ID'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Instructors retrieved successfully',
        schema: {
            example: {
                statusCode: 200,
                message: 'Instructors retrieved successfully',
                data: [
                    {
                        userId: 1,
                        email: 'instructor@example.com',
                        firstName: 'Jane',
                        lastName: 'Smith',
                        role: 'primary',
                        assignedAt: '2024-01-01T00:00:00.000Z'
                    }
                ]
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Course not found' })
    async getInstructors(@Param('id', ParseIntPipe) id: number) {
        const instructors = await this.coursesService.getInstructors(id);
        return {
            statusCode: 200,
            message: 'Instructors retrieved successfully',
            data: instructors,
        };
    }

    @Put(':id/instructors/:userId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
        summary: 'Update instructor role',
        description: 'Update an instructor\'s role in the course'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'Course ID'
    })
    @ApiParam({ 
        name: 'userId', 
        type: 'number', 
        description: 'User ID'
    })
    @ApiBody({ type: UpdateInstructorRoleDto })
    @ApiResponse({ 
        status: 200, 
        description: 'Instructor role updated successfully'
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Course or instructor not found' })
    async updateInstructorRole(
        @Param('id', ParseIntPipe) id: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Body() updateRoleDto: UpdateInstructorRoleDto
    ) {
        const instructor = await this.coursesService.updateInstructorRole(
            id,
            userId,
            updateRoleDto.role
        );

        return {
            statusCode: 200,
            message: 'Instructor role updated successfully',
            data: instructor,
        };
    }

    @Delete(':id/instructors/:userId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ 
        summary: 'Remove instructor from course',
        description: 'Remove an instructor from the course'
    })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'Course ID'
    })
    @ApiParam({ 
        name: 'userId', 
        type: 'number', 
        description: 'User ID'
    })
    @ApiResponse({ status: 204, description: 'Instructor removed successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Course or instructor not found' })
    async removeInstructor(
        @Param('id', ParseIntPipe) id: number,
        @Param('userId', ParseIntPipe) userId: number
    ) {
        await this.coursesService.removeInstructor(id, userId);
    }
}