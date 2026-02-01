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
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorators';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

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