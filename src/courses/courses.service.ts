import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseProvider } from 'src/database/database.provider';
import { course } from '../database/schema';
import { eq } from 'drizzle-orm';
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

    async create(dto: CreateCourseDto, userId: number) {
        // Convert tags array to JSON string if provided
        const tagsString = dto.tags ? JSON.stringify(dto.tags) : null;

        const newCourse = {
            ...dto,
            tags: tagsString,
            createdBy: userId,
            publishedAt: dto.publishStatus === 'published' ? new Date() : null,
            lastUpdated: new Date(),
            rating: 0,
            enrollmentCount: 0
        };

        const db = this.databaseProvider.getDb();
        const [insertedCourse] = await db
        .insert(course)
        .values(newCourse)
        .returning();

        return {
        ...insertedCourse,
        // Parse tags back to array if they exist
        tags: insertedCourse.tags ? JSON.parse(insertedCourse.tags) : null
        };
    }

  
}
