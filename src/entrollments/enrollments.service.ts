import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseProvider } from '../database/database.provider';
import { enrollments, lessonProgress, courses } from '../database/schema';
import { eq, and } from 'drizzle-orm';

export type CreateEnrollmentDto = {
    userId: number;
    courseId: number;
    paymentStatus?: 'pending' | 'paid' | 'free' | 'refunded';
};

export type UpdateEnrollmentDto = {
    completedAt?: Date;
    paymentStatus?: 'pending' | 'paid' | 'free' | 'refunded';
    progressPercentage?: number;
};

@Injectable()
export class EnrollmentsService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    async create(enrollmentData: CreateEnrollmentDto) {
        const db = this.databaseProvider.getDb();

        // Check if course exists
        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, enrollmentData.courseId));

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Check if already enrolled
        const [existing] = await db
            .select()
            .from(enrollments)
            .where(
                and(
                    eq(enrollments.userId, enrollmentData.userId),
                    eq(enrollments.courseId, enrollmentData.courseId)
                )
            );

        if (existing) {
            throw new Error('User already enrolled in this course');
        }

        const [newEnrollment] = await db
            .insert(enrollments)
            .values({
                userId: enrollmentData.userId,
                courseId: enrollmentData.courseId,
                enrolledAt: new Date(),
                paymentStatus: enrollmentData.paymentStatus || 'free',
                progressPercentage: 0,
            })
            .returning();

        return newEnrollment;
    }

    async findByUserId(userId: number) {
        const db = this.databaseProvider.getDb();
        
        const userEnrollments = await db
            .select()
            .from(enrollments)
            .where(eq(enrollments.userId, userId));

        return userEnrollments;
    }

    async findByCourseId(courseId: number) {
        const db = this.databaseProvider.getDb();
        
        const courseEnrollments = await db
            .select()
            .from(enrollments)
            .where(eq(enrollments.courseId, courseId));

        return courseEnrollments;
    }

    async findOne(enrollmentId: number) {
        const db = this.databaseProvider.getDb();
        
        const [enrollment] = await db
            .select()
            .from(enrollments)
            .where(eq(enrollments.id, enrollmentId));

        if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
        }

        return enrollment;
    }

    async update(enrollmentId: number, updateData: UpdateEnrollmentDto) {
        const db = this.databaseProvider.getDb();

        const [updated] = await db
            .update(enrollments)
            .set(updateData)
            .where(eq(enrollments.id, enrollmentId))
            .returning();

        if (!updated) {
            throw new NotFoundException('Enrollment not found');
        }

        return updated;
    }

    async delete(enrollmentId: number) {
        const db = this.databaseProvider.getDb();

        // Delete associated lesson progress first
        await db
            .delete(lessonProgress)
            .where(eq(lessonProgress.enrollmentId, enrollmentId));

        const [deleted] = await db
            .delete(enrollments)
            .where(eq(enrollments.id, enrollmentId))
            .returning();

        if (!deleted) {
            throw new NotFoundException('Enrollment not found');
        }

        return deleted;
    }

    async getEnrollmentWithProgress(userId: number, courseId: number) {
        const db = this.databaseProvider.getDb();

        const [enrollment] = await db
            .select()
            .from(enrollments)
            .where(
                and(
                    eq(enrollments.userId, userId),
                    eq(enrollments.courseId, courseId)
                )
            );

        if (!enrollment) {
            throw new NotFoundException('Enrollment not found');
        }

        // Get lesson progress
        const progress = await db
            .select()
            .from(lessonProgress)
            .where(eq(lessonProgress.enrollmentId, enrollment.id));

        return {
            ...enrollment,
            lessonProgress: progress,
        };
    }
}