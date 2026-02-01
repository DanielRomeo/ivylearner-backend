import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiBody,
    ApiProperty,
    ApiPropertyOptional
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorators';
import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsBoolean, IsString } from 'class-validator';

export enum ContentType {
    VIDEO = 'video',
    TEXT = 'text',
    QUIZ = 'quiz',
    ATTACHMENT = 'attachment',
    LIVE = 'live',
}

export class CreateLessonDto {
    @ApiProperty({
        description: 'ID of the course this lesson belongs to',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    courseId: number;

    @ApiProperty({
        description: 'Title of the lesson',
        example: 'Introduction to React Hooks',
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Order/sequence of the lesson in the course',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    orderIndex: number;

    @ApiProperty({
        description: 'Type of lesson content',
        enum: ContentType,
        example: ContentType.VIDEO,
    })
    @IsNotEmpty()
    @IsEnum(ContentType)
    contentType: ContentType;

    @ApiPropertyOptional({
        description: 'URL to the video (for video lessons)',
        example: 'https://example.com/videos/lesson1.mp4',
    })
    @IsOptional()
    @IsString()
    videoUrl?: string;

    @ApiPropertyOptional({
        description: 'Text content (for text lessons)',
        example: 'This lesson covers the basics of React Hooks...',
    })
    @IsOptional()
    @IsString()
    contentText?: string;

    @ApiPropertyOptional({
        description: 'Duration of the lesson in minutes',
        example: 45,
    })
    @IsOptional()
    @IsNumber()
    durationMinutes?: number;

    @ApiPropertyOptional({
        description: 'Whether this lesson is available as a free preview',
        example: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    isFreePreview?: boolean;

    @ApiPropertyOptional({
        description: 'ID of the instructor teaching this lesson',
        example: 1,
    })
    @IsOptional()
    @IsNumber()
    instructorId?: number;
}

export class UpdateLessonDto {
    @ApiPropertyOptional({
        description: 'Title of the lesson',
        example: 'Advanced React Hooks',
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional({
        description: 'Order/sequence of the lesson',
        example: 2,
    })
    @IsOptional()
    @IsNumber()
    orderIndex?: number;

    @ApiPropertyOptional({
        description: 'Type of lesson content',
        enum: ContentType,
    })
    @IsOptional()
    @IsEnum(ContentType)
    contentType?: ContentType;

    @ApiPropertyOptional({
        description: 'URL to the video',
        example: 'https://example.com/videos/lesson1-updated.mp4',
    })
    @IsOptional()
    @IsString()
    videoUrl?: string;

    @ApiPropertyOptional({
        description: 'Text content',
    })
    @IsOptional()
    @IsString()
    contentText?: string;

    @ApiPropertyOptional({
        description: 'Duration in minutes',
        example: 50,
    })
    @IsOptional()
    @IsNumber()
    durationMinutes?: number;

    @ApiPropertyOptional({
        description: 'Free preview status',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isFreePreview?: boolean;

    @ApiPropertyOptional({
        description: 'Instructor ID',
        example: 2,
    })
    @IsOptional()
    @IsNumber()
    instructorId?: number;
}

export class UpdateLessonProgressDto {
    @ApiPropertyOptional({
        description: 'Whether the lesson is completed',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    completed?: boolean;

    @ApiPropertyOptional({
        description: 'Percentage of the lesson watched (0-100)',
        example: 85.5,
    })
    @IsOptional()
    @IsNumber()
    watchedPercentage?: number;
}

export class LessonResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 1 })
    courseId: number;

    @ApiProperty({ example: 'Introduction to React Hooks' })
    title: string;

    @ApiProperty({ example: 1 })
    orderIndex: number;

    @ApiProperty({ enum: ContentType, example: ContentType.VIDEO })
    contentType: ContentType;

    @ApiPropertyOptional({ example: 'https://example.com/videos/lesson1.mp4' })
    videoUrl?: string;

    @ApiPropertyOptional({ example: 'This lesson covers...' })
    contentText?: string;

    @ApiPropertyOptional({ example: 45 })
    durationMinutes?: number;

    @ApiProperty({ example: false })
    isFreePreview: boolean;

    @ApiPropertyOptional({ example: 1 })
    instructorId?: number;

    @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-20T00:00:00.000Z' })
    updatedAt: Date;
}

export class LessonProgressResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 1 })
    enrollmentId: number;

    @ApiProperty({ example: 1 })
    lessonId: number;

    @ApiProperty({ example: true })
    completed: boolean;

    @ApiProperty({ example: 100 })
    watchedPercentage: number;

    @ApiPropertyOptional({ example: '2024-01-20T14:30:00.000Z' })
    lastWatchedAt?: Date;
}

@ApiTags('Lessons')
@ApiBearerAuth('JWT-auth')
@Controller('lessons')
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new lesson' })
    async create(@Body() lessonData: any, @CurrentUser() user: any) {
        const newLesson = await this.lessonsService.create(
            lessonData,
            user.id
        );

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Lesson created successfully',
            data: newLesson,
        };
    }

    @Get('course/:courseId')
    @ApiOperation({ summary: 'Get all lessons for a course' })
    async getCourseLessons(
        @Param('courseId', ParseIntPipe) courseId: number
    ) {
        const lessons = await this.lessonsService.findByCourseId(courseId);

        return {
            statusCode: HttpStatus.OK,
            message: 'Lessons retrieved successfully',
            data: lessons,
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific lesson' })
    async getOne(@Param('id', ParseIntPipe) id: number) {
        const lesson = await this.lessonsService.findOne(id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Lesson retrieved successfully',
            data: lesson,
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update a lesson' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateData: any
    ) {
        const updated = await this.lessonsService.update(id, updateData);

        return {
            statusCode: HttpStatus.OK,
            message: 'Lesson updated successfully',
            data: updated,
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Delete a lesson' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.lessonsService.delete(id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Lesson deleted successfully',
        };
    }

    // Progress tracking endpoints
    @Put(':id/progress')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update lesson progress' })
    async updateProgress(
        @Param('id', ParseIntPipe) lessonId: number,
        @Body() progressData: any,
        @CurrentUser() user: any
    ) {
        const progress = await this.lessonsService.updateProgress(
            user.id,
            lessonId,
            progressData
        );

        return {
            statusCode: HttpStatus.OK,
            message: 'Progress updated successfully',
            data: progress,
        };
    }

    @Get(':id/progress')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get lesson progress for current user' })
    async getProgress(
        @Param('id', ParseIntPipe) lessonId: number,
        @CurrentUser() user: any
    ) {
        const progress = await this.lessonsService.getLessonProgress(
            user.id,
            lessonId
        );

        return {
            statusCode: HttpStatus.OK,
            message: 'Progress retrieved successfully',
            data: progress,
        };
    }

    @Get('course/:courseId/progress')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get course progress for current user' })
    async getCourseProgress(
        @Param('courseId', ParseIntPipe) courseId: number,
        @CurrentUser() user: any
    ) {
        const progress = await this.lessonsService.getCourseProgress(
            user.id,
            courseId
        );

        return {
            statusCode: HttpStatus.OK,
            message: 'Course progress retrieved successfully',
            data: progress,
        };
    }
}