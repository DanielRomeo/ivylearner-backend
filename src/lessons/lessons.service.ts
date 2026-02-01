import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseProvider } from '../database/database.provider';
import {
    lessons,
    lessonProgress,
    courseInstructors,
    enrollments,
} from '../database/schema';
import { eq, and } from 'drizzle-orm';

export type CreateLessonDto = {
    courseId: number;
    title: string;
    orderIndex: number;
    contentType: 'video' | 'text' | 'quiz' | 'attachment' | 'live';
    videoUrl?: string;
    contentText?: string;
    durationMinutes?: number;
    isFreePreview?: boolean;
    instructorId?: number;
};

export type UpdateLessonDto = Partial<CreateLessonDto>;

export type UpdateLessonProgressDto = {
    completed?: boolean;
    watchedPercentage?: number;
};

@Injectable()
export class LessonsService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    async create(lessonData: CreateLessonDto, currentUserId: number) {
        const db = this.databaseProvider.getDb();

        // Verify instructor is assigned to this course
        if (lessonData.instructorId) {
            const [instructorAssignment] = await db
                .select()
                .from(courseInstructors)
                .where(
                    and(
                        eq(courseInstructors.courseId, lessonData.courseId),
                        eq(courseInstructors.userId, lessonData.instructorId)
                    )
                );

            if (!instructorAssignment) {
                throw new ForbiddenException(
                    'Instructor must be assigned to this course first'
                );
            }
        }

        const [newLesson] = await db
            .insert(lessons)
            .values({
                ...lessonData,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return newLesson;
    }

    async findByCourseId(courseId: number) {
        const db = this.databaseProvider.getDb();

        const courseLessons = await db
            .select()
            .from(lessons)
            .where(eq(lessons.courseId, courseId))
            .orderBy(lessons.orderIndex);

        return courseLessons;
    }

    async findOne(lessonId: number) {
        const db = this.databaseProvider.getDb();

        const [lesson] = await db
            .select()
            .from(lessons)
            .where(eq(lessons.id, lessonId));

        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        return lesson;
    }

    async update(lessonId: number, updateData: UpdateLessonDto) {
        const db = this.databaseProvider.getDb();

        // If updating instructor, verify they're assigned to the course
        if (updateData.instructorId && updateData.courseId) {
            const [instructorAssignment] = await db
                .select()
                .from(courseInstructors)
                .where(
                    and(
                        eq(courseInstructors.courseId, updateData.courseId),
                        eq(courseInstructors.userId, updateData.instructorId)
                    )
                );

            if (!instructorAssignment) {
                throw new ForbiddenException(
                    'Instructor must be assigned to this course'
                );
            }
        }

        const [updated] = await db
            .update(lessons)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(lessons.id, lessonId))
            .returning();

        if (!updated) {
            throw new NotFoundException('Lesson not found');
        }

        return updated;
    }

    async delete(lessonId: number) {
        const db = this.databaseProvider.getDb();

        // Delete associated lesson progress first
        await db
            .delete(lessonProgress)
            .where(eq(lessonProgress.lessonId, lessonId));

        const [deleted] = await db
            .delete(lessons)
            .where(eq(lessons.id, lessonId))
            .returning();

        if (!deleted) {
            throw new NotFoundException('Lesson not found');
        }

        return deleted;
    }

    // Lesson Progress Methods
    async updateProgress(
        userId: number,
        lessonId: number,
        progressData: UpdateLessonProgressDto
    ) {
        const db = this.databaseProvider.getDb();

        // Get the lesson to find course
        const [lesson] = await db
            .select()
            .from(lessons)
            .where(eq(lessons.id, lessonId));

        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        // Get enrollment
        const [enrollment] = await db
            .select()
            .from(enrollments)
            .where(
                and(
                    eq(enrollments.userId, userId),
                    eq(enrollments.courseId, lesson.courseId)
                )
            );

        if (!enrollment) {
            throw new ForbiddenException('User not enrolled in this course');
        }

        // Check if progress record exists
        const [existingProgress] = await db
            .select()
            .from(lessonProgress)
            .where(
                and(
                    eq(lessonProgress.enrollmentId, enrollment.id),
                    eq(lessonProgress.lessonId, lessonId)
                )
            );

        if (existingProgress) {
            // Update existing progress
            const [updated] = await db
                .update(lessonProgress)
                .set({
                    ...progressData,
                    lastWatchedAt: new Date(),
                })
                .where(eq(lessonProgress.id, existingProgress.id))
                .returning();

            return updated;
        } else {
            // Create new progress record
            const [newProgress] = await db
                .insert(lessonProgress)
                .values({
                    enrollmentId: enrollment.id,
                    lessonId: lessonId,
                    completed: progressData.completed || false,
                    watchedPercentage: progressData.watchedPercentage || 0,
                    lastWatchedAt: new Date(),
                })
                .returning();

            return newProgress;
        }
    }

    async getLessonProgress(userId: number, lessonId: number) {
        const db = this.databaseProvider.getDb();

        // Get the lesson to find course
        const [lesson] = await db
            .select()
            .from(lessons)
            .where(eq(lessons.id, lessonId));

        if (!lesson) {
            throw new NotFoundException('Lesson not found');
        }

        // Get enrollment
        const [enrollment] = await db
            .select()
            .from(enrollments)
            .where(
                and(
                    eq(enrollments.userId, userId),
                    eq(enrollments.courseId, lesson.courseId)
                )
            );

        if (!enrollment) {
            return null;
        }

        // Get progress
        const [progress] = await db
            .select()
            .from(lessonProgress)
            .where(
                and(
                    eq(lessonProgress.enrollmentId, enrollment.id),
                    eq(lessonProgress.lessonId, lessonId)
                )
            );

        return progress || null;
    }

    async getCourseProgress(userId: number, courseId: number) {
        const db = this.databaseProvider.getDb();

        // Get enrollment
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
            throw new ForbiddenException('User not enrolled in this course');
        }

        // Get all lessons for the course
        const courseLessons = await db
            .select()
            .from(lessons)
            .where(eq(lessons.courseId, courseId))
            .orderBy(lessons.orderIndex);

        // Get all progress records for this enrollment
        const progressRecords = await db
            .select()
            .from(lessonProgress)
            .where(eq(lessonProgress.enrollmentId, enrollment.id));

        // Map progress to lessons
        const lessonsWithProgress = courseLessons.map((lesson) => {
            const progress = progressRecords.find(
                (p) => p.lessonId === lesson.id
            );
            return {
                ...lesson,
                progress: progress || null,
            };
        });

        // Calculate overall progress
        const completedLessons = progressRecords.filter(
            (p) => p.completed
        ).length;
        const totalLessons = courseLessons.length;
        const overallProgress =
            totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        return {
            lessons: lessonsWithProgress,
            overallProgress,
            completedLessons,
            totalLessons,
        };
    }
}