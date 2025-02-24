import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseProvider } from 'src/database/database.provider';
import { course } from '../database/schema';
import { eq, sql } from 'drizzle-orm';
import { CourseType } from 'src/interfaces/courseType.interface';

// Define the DTO for course creation
export interface CreateCourseDto {
    title: string;
    shortDescription: string;
    description?: string;
    thumbnail?: string;
    price?: number;
    duration?: number;
    level?: 'beginner' | 'intermediate' | 'advanced';
    prerequisites?: string;
    objectives?: string;
    tags?: string[];
    language: string;
    certificateAvailable?: boolean;
    featured?: boolean;
    publishStatus?: 'draft' | 'published' | 'archived';
    organisationId: number;
}

interface CourseQueryParams {
    limit?: number;
    offset?: number;
    publishStatus?: 'draft' | 'published' | 'archived';
}

@Injectable()
export class CoursesService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    // Find a single course by ID
    async findOne(id: number) {
        const db = this.databaseProvider.getDb();
        const result = await db
            .select()
            .from(course)
            .where(eq(course.id, id))
            .limit(1);

        const courseData = result[0];
        if (!courseData) {
            throw new NotFoundException(`Course with ID ${id} not found`);
        }

        // Parse tags back to array if needed
        return {
            ...courseData,
            tags: courseData.tags ? JSON.parse(courseData.tags) : null,
        };
    }

    // Update a course
    async updateCourse(
        id: number,
        updateData: Partial<CreateCourseDto> & { lastUpdated: Date },
    ) {
        const db = this.databaseProvider.getDb();

        // Convert tags to JSON string if provided
        const tagsString = updateData.tags
            ? JSON.stringify(updateData.tags)
            : undefined;

        // Update the course
        const [updatedCourse] = await db
            .update(course)
            .set({
                ...updateData,
                tags: tagsString, // Update tags if provided
            })
            .where(eq(course.id, id))
            .returning();

        if (!updatedCourse) {
            throw new NotFoundException(`Course with ID ${id} not found`);
        }

        // Parse tags back to array if needed
        return {
            ...updatedCourse,
            tags: updatedCourse.tags ? JSON.parse(updatedCourse.tags) : null,
        };
    }

    // create a course:
    async create(
        courseData: CreateCourseDto & {
            createdBy: number;
            publishStatus: 'draft';
            lastUpdated: Date;
            rating: number;
            enrollmentCount: number;
        },
    ) {
        // Convert tags to JSON string if provided
        const tagsString = courseData.tags
            ? JSON.stringify(courseData.tags)
            : null;

        const db = this.databaseProvider.getDb();
        const [newCourse] = await db
            .insert(course)
            .values({
                ...courseData,
                tags: tagsString,
            })
            .returning();

        return {
            ...newCourse,
            tags: newCourse.tags ? JSON.parse(newCourse.tags) : null,
        };
    }

    // find the courses owned by an instructor:
    async findCoursesByInstructorId(
        instructorId: number,
        options: { limit: number; offset: number },
    ) {
        const db = this.databaseProvider.getDb();
        const results = await db
            .select()
            .from(course)
            .where(eq(course.createdBy, instructorId))
            .limit(options.limit)
            .offset(options.offset);

        return results.map((courseData) => ({

        return results.map((courseData) => ({
            ...courseData,
            tags: courseData.tags ? JSON.parse(courseData.tags) : null, // Parse tags back to array
        }));
    }
}
