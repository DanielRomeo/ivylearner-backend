import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseProvider } from 'src/database/database.provider';
import { course } from '../database/schema';
import { eq , sql} from 'drizzle-orm';
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
    organisationId: number

}

interface CourseQueryParams {
    limit?: number;
    offset?: number;
    publishStatus?: 'draft' | 'published' | 'archived';
}

@Injectable()
export class CoursesService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    // find one course:
    async findOne(id: number) {
        const db = this.databaseProvider.getDb();

        const result = await db.select()
        .from(course)
        .where(eq(course.id, id))
        .limit(1);
        
        const courseData = result[0];
        if (!courseData) {
            throw new NotFoundException(`Course with ID ${id} not found`);
        }
        return courseData;
    }

    // create a course:
    async create(courseData: CreateCourseDto & {
        createdBy: number;
        publishStatus: 'draft';
        lastUpdated: Date;
        rating: number;
        enrollmentCount: number;
    }) {
        // Convert tags to JSON string if provided
        const tagsString = courseData.tags ? JSON.stringify(courseData.tags) : null;
        
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
            tags: newCourse.tags ? JSON.parse(newCourse.tags) : null
        };
    }

    // find the courses owned by an instructor:
    // Find courses by instructor ID:
    async findCoursesByInstructorId(instructorId: number) {
        const db = this.databaseProvider.getDb();

        const results = await db
            .select()
            .from(course)
            .where(eq(course.createdBy, instructorId));

        return results.map(courseData => ({
            ...courseData,
            tags: courseData.tags ? JSON.parse(courseData.tags) : null, // Parse tags back to array
        }));
    }

  
}