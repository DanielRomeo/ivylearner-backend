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
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorators';
import { IsNotEmpty, IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FREE = 'free',
    REFUNDED = 'refunded',
}

export class CreateEnrollmentDto {
    @ApiProperty({
        description: 'ID of the course to enroll in',
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    courseId: number;

    @ApiPropertyOptional({
        description: 'Payment status of the enrollment',
        enum: PaymentStatus,
        default: PaymentStatus.FREE,
    })
    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus?: PaymentStatus;
}

export class UpdateEnrollmentDto {
    @ApiPropertyOptional({
        description: 'Completion date of the course',
        example: '2024-12-31T00:00:00.000Z',
    })
    @IsOptional()
    completedAt?: Date;

    @ApiPropertyOptional({
        description: 'Payment status',
        enum: PaymentStatus,
    })
    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus?: PaymentStatus;

    @ApiPropertyOptional({
        description: 'Progress percentage (0-100)',
        example: 75.5,
    })
    @IsOptional()
    @IsNumber()
    progressPercentage?: number;
}

export class EnrollmentResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 1 })
    userId: number;

    @ApiProperty({ example: 1 })
    courseId: number;

    @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
    enrolledAt: Date;

    @ApiPropertyOptional({ example: '2024-03-15T00:00:00.000Z' })
    completedAt?: Date;

    @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.FREE })
    paymentStatus: PaymentStatus;

    @ApiProperty({ example: 45.5 })
    progressPercentage: number;
}



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