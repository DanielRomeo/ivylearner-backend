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
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorators';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Enrollments')
@ApiBearerAuth('JWT-auth')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
    constructor(private readonly enrollmentsService: EnrollmentsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Enroll user in a course' })
    async create(
        @Body() enrollmentData: { courseId: number; paymentStatus?: string },
        @CurrentUser() user: any
    ) {
        const newEnrollment = await this.enrollmentsService.create({
            userId: user.id,
            courseId: enrollmentData.courseId,
            paymentStatus: enrollmentData.paymentStatus as any,
        });

        return {
            statusCode: HttpStatus.CREATED,
            message: 'Successfully enrolled in course',
            data: newEnrollment,
        };
    }

    @Get('my-enrollments')
    @ApiOperation({ summary: 'Get current user enrollments' })
    async getMyEnrollments(@CurrentUser() user: any) {
        const enrollments = await this.enrollmentsService.findByUserId(user.id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Enrollments retrieved successfully',
            data: enrollments,
        };
    }

    @Get('course/:courseId')
    @ApiOperation({ summary: 'Get all enrollments for a course' })
    async getCourseEnrollments(
        @Param('courseId', ParseIntPipe) courseId: number
    ) {
        const enrollments = await this.enrollmentsService.findByCourseId(courseId);

        return {
            statusCode: HttpStatus.OK,
            message: 'Course enrollments retrieved successfully',
            data: enrollments,
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get specific enrollment' })
    async getOne(@Param('id', ParseIntPipe) id: number) {
        const enrollment = await this.enrollmentsService.findOne(id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Enrollment retrieved successfully',
            data: enrollment,
        };
    }

    @Get('progress/:courseId')
    @ApiOperation({ summary: 'Get enrollment with lesson progress' })
    async getEnrollmentProgress(
        @Param('courseId', ParseIntPipe) courseId: number,
        @CurrentUser() user: any
    ) {
        const enrollmentWithProgress =
            await this.enrollmentsService.getEnrollmentWithProgress(
                user.id,
                courseId
            );

        return {
            statusCode: HttpStatus.OK,
            message: 'Enrollment progress retrieved successfully',
            data: enrollmentWithProgress,
        };
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update enrollment' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateData: any
    ) {
        const updated = await this.enrollmentsService.update(id, updateData);

        return {
            statusCode: HttpStatus.OK,
            message: 'Enrollment updated successfully',
            data: updated,
        };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete enrollment' })
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.enrollmentsService.delete(id);

        return {
            statusCode: HttpStatus.OK,
            message: 'Enrollment deleted successfully',
        };
    }
}