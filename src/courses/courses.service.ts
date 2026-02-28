import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseProvider } from '../database/database.provider';
import { 
    courses, 
    courseInstructors, 
    organizations,
    users,
    organizationMembers,
    enrollments,
    Course, 
    NewCourse, 
    CourseInstructor ,
    userProfiles,
} from '../database/schema';
import { eq, and, sql } from 'drizzle-orm';

// slug


@Injectable()
export class CoursesService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    // Helper function to generate slug from title
    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    // Ensure slug is unique by appending a counter if necessary
    private async generateUniqueSlug(db, title: string): Promise<string> {
        const baseSlug = this.generateSlug(title);
        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const [existing] = await db
                .select()
                .from(courses)
                .where(eq(courses.slug, slug));

            if (!existing) break;
            slug = `${baseSlug}-${counter++}`;
        }

        return slug;
    }

 

    // Create a new course
    async create(courseData: Partial<NewCourse>): Promise<Course> {
        const db = this.databaseProvider.getDb();

        // Generate slug if not provided
        // const slug = courseData.slug || this.generateSlug(courseData.title!);
        
        const slug = await this.generateUniqueSlug(db, courseData.title!);

        // Check if organization exists
        const [org] = await db
            .select()
            .from(organizations)
            .where(eq(organizations.id, courseData.organizationId!));

        if (!org) {
            throw new HttpException('Organization not found', HttpStatus.NOT_FOUND);
        }

        // Check if user is a member of the organization
        const [membership] = await db
            .select()
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, courseData.organizationId!),
                    eq(organizationMembers.userId, courseData.createdByUserId!)
                )
            );
            console.log('membership:', membership);
        if (!membership || (membership.role !== 'owner' && membership.role !== 'admin' && membership.role !== 'instructor')) {
            throw new HttpException(
                'Only organization members with instructor, admin, or owner role can create courses',
                HttpStatus.FORBIDDEN
            );
        }

        const [newCourse] = await db
            .insert(courses)
            .values({
                ...courseData,
                slug,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        // Automatically add the creator as primary instructor
        if (newCourse && courseData.createdByUserId) {
            await db.insert(courseInstructors).values({
                courseId: newCourse.id,
                userId: courseData.createdByUserId,
                role: 'primary',
                assignedAt: new Date(),
            });
        }

        return newCourse;
    }

    // Get all courses (optionally filter by organization)
    async findAll(organizationId?: number): Promise<Course[]> {
        const db = this.databaseProvider.getDb();

        if (organizationId) {
            const coursesData = await db
                .select()
                .from(courses)
                .where(eq(courses.organizationId, organizationId));
            return coursesData;
        }

        const allCourses = await db.select().from(courses);
        return allCourses;
    }

    // Get public stats (total courses and total students)
    async getPublicStats(): Promise<{ totalCourses: number; totalStudents: number }> {
        const db = this.databaseProvider.getDb();

        const [courseCount] = await db
            .select({ count: sql<number>`count(*)` })
            .from(courses)
            .where(eq(courses.isPublished, true));

        const [studentCount] = await db
            .select({ count: sql<number>`count(distinct ${enrollments.userId})` })
            .from(enrollments);

        return {
            totalCourses: Number(courseCount?.count ?? 0),
            totalStudents: Number(studentCount?.count ?? 0),
        };
    }

    async getFeaturedCourses() {
        const db = this.databaseProvider.getDb();

        const featured = await db
            .select({
                id: courses.id,
                title: courses.title,
                slug: courses.slug,
                shortDescription: courses.shortDescription,
                thumbnailUrl: courses.thumbnailUrl,
                instructorFirstName: users.firstName,
                instructorLastName: users.lastName,
                enrollmentCount: sql<number>`count(${enrollments.id})`,
            })
            .from(courses)
            .leftJoin(enrollments, eq(enrollments.courseId, courses.id))
            .leftJoin(users, eq(users.id, courses.createdByUserId))
            .where(eq(courses.isPublished, true))
            .groupBy(
                courses.id,
                courses.title,
                courses.slug,
                courses.shortDescription,
                courses.thumbnailUrl,
                users.firstName,
                users.lastName,
            )
            .orderBy(sql`count(${enrollments.id}) desc`)
            .limit(3);

        return featured.map((c) => ({
            ...c,
            enrollmentCount: Number(c.enrollmentCount),
        }));
    }


    // Get published courses only
    async findPublished(organizationId?: number): Promise<Course[]> {
        const db = this.databaseProvider.getDb();

        if (organizationId) {
            const coursesData = await db
                .select()
                .from(courses)
                .where(
                    and(
                        eq(courses.organizationId, organizationId),
                        eq(courses.isPublished, true)
                    )
                );
            return coursesData;
        }

        const publishedCourses = await db
            .select()
            .from(courses)
            .where(eq(courses.isPublished, true));

        return publishedCourses;
    }

    // FIND ALL PUBLISHED COURSES WITH INSTRUCTORS
   async findAllPublished() {
        const db = this.databaseProvider.getDb();

        const publishedCourses = await db
            .select()
            .from(courses)
            .where(eq(courses.isPublished, true));

        if (publishedCourses.length === 0) return [];

        const coursesWithInstructors = await Promise.all(
            publishedCourses.map(async (course) => {
                const instructors = await this.getInstructorsForCourse(course.id);
                return { ...course, instructors };
            }),
        );

        return coursesWithInstructors;
    }

     // ─── Private helper ───────────────────────────────────────────────────────
    private async getInstructorsForCourse(courseId: number) {
        const db = this.databaseProvider.getDb();

        const rows = await db
            .select({
                userId: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
                instructorRole: courseInstructors.role,
                // These come from user_profiles via LEFT JOIN — may be null/undefined
                profilePictureUrl: userProfiles.profilePictureUrl,
                bio: userProfiles.bio,
                timezone: userProfiles.timezone,
                country: userProfiles.country,
            })
            .from(courseInstructors)
            .innerJoin(users, eq(courseInstructors.userId, users.id))
            .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
            .where(eq(courseInstructors.courseId, courseId));

        // Sanitize: replace any undefined with null so SQLite serialization never breaks
        return rows.map((row) => ({
            userId: row.userId,
            firstName: row.firstName ?? null,
            lastName: row.lastName ?? null,
            email: row.email,
            instructorRole: row.instructorRole,
            profilePictureUrl: row.profilePictureUrl ?? null,
            bio: row.bio ?? null,
            timezone: row.timezone ?? null,
            country: row.country ?? null,
        }));
    }



    // Get course by ID
    async findById(id: number): Promise<Course> {
        const db = this.databaseProvider.getDb();

        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, id));

        if (!course) {
            throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
        }

        return course;
    }

    // Get course by slug
    async findBySlug(slug: string) {
        const db = this.databaseProvider.getDb();

        const [course] = await db
            .select()
            .from(courses)
            .where(and(eq(courses.slug, slug), eq(courses.isPublished, true)));

        if (!course) return null;

        const instructors = await this.getInstructorsForCourse(course.id);
        return { ...course, instructors };
    }

    // Get courses created by a specific user
    async findByCreator(userId: number): Promise<Course[]> {
        const db = this.databaseProvider.getDb();

        const coursesData = await db
            .select()
            .from(courses)
            .where(eq(courses.createdByUserId, userId));

        return coursesData;
    }

    // Get courses where user is an instructor
    async findByInstructor(userId: number): Promise<(Course & { instructorRole: string })[]> {
        const db = this.databaseProvider.getDb();

        const results = await db
            .select({
                course: courses,
                instructorRole: courseInstructors.role,
            })
            .from(courseInstructors)
            .innerJoin(courses, eq(courseInstructors.courseId, courses.id))
            .where(eq(courseInstructors.userId, userId));

        return results.map(r => ({ ...r.course, instructorRole: r.instructorRole }));
    }

    // Update course
    async update(id: number, updateData: Partial<Course>): Promise<Course> {
        const db = this.databaseProvider.getDb();

        // Check if course exists
        await this.findById(id);

        // If title is being updated, regenerate slug
        if (updateData.title) {
            updateData.slug = this.generateSlug(updateData.title);
        }

        const [updated] = await db
            .update(courses)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(courses.id, id))
            .returning();

        return updated;
    }

    // Delete course
    async remove(id: number): Promise<void> {
        const db = this.databaseProvider.getDb();

        // Check if course exists
        await this.findById(id);

        await db.delete(courses).where(eq(courses.id, id));
    }

    // ========================================================================
    // INSTRUCTOR MANAGEMENT
    // ========================================================================

    // Add an instructor to course
    async addInstructor(
        courseId: number,
        userId: number,
        role: 'primary' | 'co_instructor' | 'ta' = 'co_instructor'
    ): Promise<CourseInstructor> {
        const db = this.databaseProvider.getDb();

        // Check if course exists
        const course = await this.findById(courseId);

        // Check if user exists and has instructor role
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // Check if user is a member of the organization
        const [membership] = await db
            .select()
            .from(organizationMembers)
            .where(
                and(
                    eq(organizationMembers.organizationId, course.organizationId),
                    eq(organizationMembers.userId, userId)
                )
            );

        if (!membership || (membership.role !== 'instructor' && membership.role !== 'admin' && membership.role !== 'owner')) {
            throw new HttpException(
                'User must be an instructor, admin, or owner in the organization',
                HttpStatus.FORBIDDEN
            );
        }

        // Check if user is already an instructor for this course
        const [existing] = await db
            .select()
            .from(courseInstructors)
            .where(
                and(
                    eq(courseInstructors.courseId, courseId),
                    eq(courseInstructors.userId, userId)
                )
            );

        if (existing) {
            throw new HttpException(
                'User is already an instructor for this course',
                HttpStatus.CONFLICT
            );
        }

        const [newInstructor] = await db
            .insert(courseInstructors)
            .values({
                courseId,
                userId,
                role,
                assignedAt: new Date(),
            })
            .returning();

        return newInstructor;
    }

    // Get all instructors for a course
    async getInstructors(courseId: number) {
        const db = this.databaseProvider.getDb();

        // Check if course exists
        await this.findById(courseId);

        const instructors = await db
            .select({
                userId: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                role: courseInstructors.role,
                assignedAt: courseInstructors.assignedAt,
            })
            .from(courseInstructors)
            .innerJoin(users, eq(courseInstructors.userId, users.id))
            .where(eq(courseInstructors.courseId, courseId));

        return instructors;
    }

    // Update instructor role
    async updateInstructorRole(
        courseId: number,
        userId: number,
        newRole: 'primary' | 'co_instructor' | 'ta'
    ): Promise<CourseInstructor> {
        const db = this.databaseProvider.getDb();

        // Check if instructor exists
        const [existing] = await db
            .select()
            .from(courseInstructors)
            .where(
                and(
                    eq(courseInstructors.courseId, courseId),
                    eq(courseInstructors.userId, userId)
                )
            );

        if (!existing) {
            throw new HttpException(
                'User is not an instructor for this course',
                HttpStatus.NOT_FOUND
            );
        }

        const [updated] = await db
            .update(courseInstructors)
            .set({ role: newRole })
            .where(
                and(
                    eq(courseInstructors.courseId, courseId),
                    eq(courseInstructors.userId, userId)
                )
            )
            .returning();

        return updated;
    }

    // Remove instructor from course
    async removeInstructor(courseId: number, userId: number): Promise<void> {
        const db = this.databaseProvider.getDb();

        // Check if instructor exists
        const [existing] = await db
            .select()
            .from(courseInstructors)
            .where(
                and(
                    eq(courseInstructors.courseId, courseId),
                    eq(courseInstructors.userId, userId)
                )
            );

        if (!existing) {
            throw new HttpException(
                'User is not an instructor for this course',
                HttpStatus.NOT_FOUND
            );
        }

        await db
            .delete(courseInstructors)
            .where(
                and(
                    eq(courseInstructors.courseId, courseId),
                    eq(courseInstructors.userId, userId)
                )
            );
    }
}