import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { LessonsService } from './lessons.service';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { CurrentUser } from '../decorators/current-user.decorators';
  
  @Controller('lessons')
  export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) {}
  
    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createLesson(
      @Body() lessonData: { title: string; courseId: number; orderIndex: number; videoUrl: string },
      @CurrentUser() user,
    ) {
      try {
        // Ensure the instructor is authorized to create a lesson for the course
        const lesson = await this.lessonsService.createLesson(lessonData, user.id);
        return {
          statusCode: 201,
          message: 'Lesson created successfully',
          data: lesson,
        };
      } catch (error) {
        throw new HttpException(
          error.message || 'Failed to create lesson',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get(':id')
    async getLesson(@Param('id') id: number) {
      try {
        const lesson = await this.lessonsService.getLesson(id);
        return {
          statusCode: 200,
          data: lesson,
        };
      } catch (error) {
        throw new HttpException(
          error.message || 'Lesson not found',
          HttpStatus.NOT_FOUND,
        );
      }
    }
  
    @Get('course/:courseId')
    async getLessonsByCourse(@Param('courseId') courseId: number) {
      try {
        const lessons = await this.lessonsService.getLessonsByCourse(courseId);
        return {
          statusCode: 200,
          data: lessons,
        };
      } catch (error) {
        throw new HttpException(
          error.message || 'Failed to retrieve lessons',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteLesson(@Param('id') id: number, @CurrentUser() user) {
      try {
        await this.lessonsService.deleteLesson(id, user.id);
        return {
          statusCode: 200,
          message: 'Lesson deleted successfully',
        };
      } catch (error) {
        throw new HttpException(
          error.message || 'Failed to delete lesson',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  