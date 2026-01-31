import {
    integer,
    primaryKey,
    sqliteTable,
    text,
    real,
    uniqueIndex,
} from 'drizzle-orm/sqlite-core';

// ============================================================================
// USERS TABLE
// ============================================================================
export const users = sqliteTable('users', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    role: text('role', { enum: ['student', 'instructor', 'admin'] }).notNull().default('student'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// USER PROFILES TABLE (1:1 with users)
// ============================================================================
export const userProfiles = sqliteTable(
    'user_profiles',
    {
        userId: integer('user_id', { mode: 'number' })
            .primaryKey()
            .references(() => users.id, { onDelete: 'cascade' }),
        profilePictureUrl: text('profile_picture_url'),
        timezone: text('timezone').default('Africa/Johannesburg'),
        country: text('country').default('ZA'),
        bio: text('bio'),
        // Flexible JSON for student/instructor-specific fields
        customData: text('custom_data', { mode: 'json' }).$type<{
            student?: {
                interests: string[];
                learningGoals?: string;
                preferredStyles?: string[];
            };
            instructor?: {
                expertise: string[];
                certifications?: Array<{ name: string; issuer: string; date?: string }>;
                yearsExperience?: number;
                teachingStyle?: string;
            };
        } | null>(),
        updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    },
    (table) => ({
        userIdIdx: uniqueIndex('user_profiles_user_id_idx').on(table.userId),
    })
);

// ============================================================================
// ORGANIZATIONS TABLE
// ============================================================================
export const organizations = sqliteTable('organizations', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    logoUrl: text('logo_url'),
    website: text('website'),
    contactEmail: text('contact_email'),
    address: text('address'),
    foundedYear: integer('founded_year', { mode: 'number' }),
    isPublic: integer('is_public', { mode: 'boolean' }).default(true),
    createdByUserId: integer('created_by_user_id', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// ORGANIZATION MEMBERS TABLE (Many-to-Many)
// ============================================================================
export const organizationMembers = sqliteTable(
    'organization_members',
    {
        organizationId: integer('organization_id', { mode: 'number' })
            .notNull()
            .references(() => organizations.id, { onDelete: 'cascade' }),
        userId: integer('user_id', { mode: 'number' })
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        role: text('role', { enum: ['owner', 'admin', 'instructor', 'student'] })
            .notNull()
            .default('student'),
        joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.organizationId, table.userId] }),
    }),
);

// ============================================================================
// COURSES TABLE
// ============================================================================
export const courses = sqliteTable('courses', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    organizationId: integer('organization_id', { mode: 'number' })
        .notNull()
        .references(() => organizations.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').unique(),
    description: text('description'),
    shortDescription: text('short_description'),
    price: real('price').default(0),
    thumbnailUrl: text('thumbnail_url'),
    durationWeeks: integer('duration_weeks', { mode: 'number' }),
    language: text('language').default('English'),
    isPublished: integer('is_published', { mode: 'boolean' }).default(false),
    createdByUserId: integer('created_by_user_id', { mode: 'number' })
        .notNull()
        .references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// COURSE INSTRUCTORS TABLE (Many-to-Many)
// ============================================================================
export const courseInstructors = sqliteTable(
    'course_instructors',
    {
        courseId: integer('course_id', { mode: 'number' })
            .notNull()
            .references(() => courses.id, { onDelete: 'cascade' }),
        userId: integer('user_id', { mode: 'number' })
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        role: text('role', { enum: ['primary', 'co_instructor', 'ta'] })
            .notNull()
            .default('co_instructor'),
        assignedAt: integer('assigned_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.courseId, table.userId] }),
    }),
);

// ============================================================================
// ENROLLMENTS TABLE
// ============================================================================
export const enrollments = sqliteTable('enrollments', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: integer('user_id', { mode: 'number' })
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    courseId: integer('course_id', { mode: 'number' })
        .notNull()
        .references(() => courses.id, { onDelete: 'cascade' }),
    enrolledAt: integer('enrolled_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
    paymentStatus: text('payment_status', { 
        enum: ['pending', 'paid', 'free', 'refunded'] 
    }).notNull().default('free'),
    progressPercentage: real('progress_percentage').default(0),
});

// ============================================================================
// LESSONS TABLE
// ============================================================================
export const lessons = sqliteTable('lessons', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    courseId: integer('course_id', { mode: 'number' })
        .notNull()
        .references(() => courses.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    orderIndex: integer('order_index', { mode: 'number' }).notNull(),
    contentType: text('content_type', { 
        enum: ['video', 'text', 'quiz', 'attachment', 'live'] 
    }).notNull(),
    videoUrl: text('video_url'),
    contentText: text('content_text'),
    durationMinutes: integer('duration_minutes', { mode: 'number' }),
    isFreePreview: integer('is_free_preview', { mode: 'boolean' }).default(false),
    instructorId: integer('instructor_id', { mode: 'number' })
        .references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// LESSON PROGRESS TABLE
// ============================================================================
export const lessonProgress = sqliteTable('lesson_progress', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    enrollmentId: integer('enrollment_id', { mode: 'number' })
        .notNull()
        .references(() => enrollments.id, { onDelete: 'cascade' }),
    lessonId: integer('lesson_id', { mode: 'number' })
        .notNull()
        .references(() => lessons.id, { onDelete: 'cascade' }),
    completed: integer('completed', { mode: 'boolean' }).default(false),
    watchedPercentage: real('watched_percentage').default(0),
    lastWatchedAt: integer('last_watched_at', { mode: 'timestamp' }),
});

// ============================================================================
// TYPES FOR TYPESCRIPT
// ============================================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type NewOrganizationMember = typeof organizationMembers.$inferInsert;

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export type CourseInstructor = typeof courseInstructors.$inferSelect;
export type NewCourseInstructor = typeof courseInstructors.$inferInsert;

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type NewLessonProgress = typeof lessonProgress.$inferInsert;