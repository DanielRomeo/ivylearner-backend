import {
    pgTable,
    bigserial,
    varchar,
    text,
    boolean,
    integer,
    real,
    timestamp,
    primaryKey,
    uniqueIndex,
    pgEnum,
} from 'drizzle-orm/pg-core';

// ============================================================================
// ENUMS
// ============================================================================
export const userRoleEnum = pgEnum('user_role', ['student', 'instructor', 'admin']);
export const orgMemberRoleEnum = pgEnum('org_member_role', ['owner', 'admin', 'instructor', 'student']);
export const courseInstructorRoleEnum = pgEnum('course_instructor_role', ['primary', 'co_instructor', 'ta']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'free', 'refunded']);
export const contentTypeEnum = pgEnum('content_type', ['video', 'text', 'quiz', 'attachment', 'live']);
export const liveRoomStatusEnum = pgEnum('live_room_status', ['active', 'ended']);
export const authProviderEnum = pgEnum('auth_provider', ['local', 'google']);
export const assessmentTypeEnum = pgEnum('assessment_type', ['quiz', 'document_upload']);

// ============================================================================
// USERS TABLE
// ============================================================================
export const users = pgTable('users', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }), // nullable for Google-only users
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    role: userRoleEnum('role').notNull().default('student'),
    googleId: varchar('google_id', { length: 255 }).unique(),
    googleAccessToken: text('google_access_token'),
    avatarUrl: varchar('avatar_url', { length: 512 }),
    authProvider: authProviderEnum('auth_provider').notNull().default('local'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// USER PROFILES TABLE (1:1 with users)
// ============================================================================
export const userProfiles = pgTable(
    'user_profiles',
    {
        userId: integer('user_id')
            .primaryKey()
            .references(() => users.id, { onDelete: 'cascade' }),
        profilePictureUrl: varchar('profile_picture_url', { length: 512 }),
        timezone: varchar('timezone', { length: 100 }).default('Africa/Johannesburg'),
        country: varchar('country', { length: 10 }).default('ZA'),
        bio: text('bio'),
        customData: text('custom_data'),
        updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        userIdIdx: uniqueIndex('user_profiles_user_id_idx').on(table.userId),
    })
);

// ============================================================================
// ORGANIZATIONS TABLE
// ============================================================================
export const organizations = pgTable('organizations', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    logoUrl: varchar('logo_url', { length: 512 }),
    website: varchar('website', { length: 255 }),
    contactEmail: varchar('contact_email', { length: 255 }),
    address: text('address'),
    foundedYear: integer('founded_year'),
    isPublic: boolean('is_public').default(true),
    createdByUserId: integer('created_by_user_id')
        .notNull()
        .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// ORGANIZATION MEMBERS (Many-to-Many)
// ============================================================================
export const organizationMembers = pgTable(
    'organization_members',
    {
        organizationId: integer('organization_id')
            .notNull()
            .references(() => organizations.id, { onDelete: 'cascade' }),
        userId: integer('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        role: orgMemberRoleEnum('role').notNull().default('student'),
        joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.organizationId, table.userId] }),
    })
);

// ============================================================================
// COURSES TABLE
// ============================================================================
export const courses = pgTable('courses', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    organizationId: integer('organization_id')
        .notNull()
        .references(() => organizations.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 150 }).unique(),
    description: text('description'),
    shortDescription: varchar('short_description', { length: 500 }),
    price: real('price').default(0),
    thumbnailUrl: varchar('thumbnail_url', { length: 512 }),
    durationWeeks: integer('duration_weeks'),
    language: varchar('language', { length: 50 }).default('English'),
    isPublished: boolean('is_published').default(false),
    createdByUserId: integer('created_by_user_id')
        .notNull()
        .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// COURSE INSTRUCTORS (Many-to-Many)
// ============================================================================
export const courseInstructors = pgTable(
    'course_instructors',
    {
        courseId: integer('course_id')
            .notNull()
            .references(() => courses.id, { onDelete: 'cascade' }),
        userId: integer('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        role: courseInstructorRoleEnum('role').notNull().default('co_instructor'),
        assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.courseId, table.userId] }),
    })
);

// ============================================================================
// ENROLLMENTS TABLE
// ============================================================================
export const enrollments = pgTable('enrollments', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    courseId: integer('course_id')
        .notNull()
        .references(() => courses.id, { onDelete: 'cascade' }),
    enrolledAt: timestamp('enrolled_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    paymentStatus: paymentStatusEnum('payment_status').notNull().default('free'),
    progressPercentage: real('progress_percentage').default(0),
});

// ============================================================================
// LESSONS TABLE
// ============================================================================
export const lessons = pgTable('lessons', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    courseId: integer('course_id')
        .notNull()
        .references(() => courses.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    orderIndex: integer('order_index').notNull(),
    contentType: contentTypeEnum('content_type').notNull(),
    videoUrl: varchar('video_url', { length: 512 }),
    contentText: text('content_text'),
    durationMinutes: integer('duration_minutes'),
    isFreePreview: boolean('is_free_preview').default(false),
    instructorId: integer('instructor_id').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// LESSON PROGRESS TABLE
// ============================================================================
export const lessonProgress = pgTable('lesson_progress', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    enrollmentId: integer('enrollment_id')
        .notNull()
        .references(() => enrollments.id, { onDelete: 'cascade' }),
    lessonId: integer('lesson_id')
        .notNull()
        .references(() => lessons.id, { onDelete: 'cascade' }),
    completed: boolean('completed').default(false),
    watchedPercentage: real('watched_percentage').default(0),
    lastWatchedAt: timestamp('last_watched_at', { withTimezone: true }),
});

// ============================================================================
// LIVE ROOMS TABLE
// ============================================================================
export const liveRooms = pgTable('live_rooms', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    courseId: integer('course_id').notNull().references(() => courses.id),
    instructorUserId: integer('instructor_user_id').notNull().references(() => users.id),
    title: varchar('title', { length: 255 }).notNull(),
    dailyRoomName: varchar('daily_room_name', { length: 255 }).notNull().unique(),
    dailyRoomUrl: varchar('daily_room_url', { length: 512 }).notNull(),
    status: liveRoomStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
});

// ============================================================================
// COURSE DOCUMENTS TABLE
// ============================================================================
export const courseDocuments = pgTable('course_documents', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    uploadedByUserId: integer('uploaded_by_user_id').notNull().references(() => users.id),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    fileUrl: varchar('file_url', { length: 512 }).notNull(),
    fileSizeBytes: integer('file_size_bytes'),
    mimeType: varchar('mime_type', { length: 100 }).default('application/pdf'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// ASSESSMENTS TABLE
// ============================================================================
export const assessments = pgTable('assessments', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    createdByUserId: integer('created_by_user_id').notNull().references(() => users.id),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    assessmentType: assessmentTypeEnum('assessment_type').notNull().default('quiz'),
    passingPercentage: real('passing_percentage').notNull().default(50),
    isPublished: boolean('is_published').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// ASSESSMENT QUESTIONS TABLE
// ============================================================================
export const assessmentQuestions = pgTable('assessment_questions', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    assessmentId: integer('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),
    questionText: text('question_text'),
    imageUrl: varchar('image_url', { length: 512 }),
    orderIndex: integer('order_index').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// ASSESSMENT OPTIONS TABLE
// ============================================================================
export const assessmentOptions = pgTable('assessment_options', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    questionId: integer('question_id').notNull().references(() => assessmentQuestions.id, { onDelete: 'cascade' }),
    optionText: text('option_text').notNull(),
    isCorrect: boolean('is_correct').notNull().default(false),
    orderIndex: integer('order_index').notNull(),
});

// ============================================================================
// ASSESSMENT SUBMISSIONS TABLE
// uniqueIndex enforces one attempt only per student per assessment
// ============================================================================
export const assessmentSubmissions = pgTable(
    'assessment_submissions',
    {
        id: bigserial('id', { mode: 'number' }).primaryKey(),
        assessmentId: integer('assessment_id').notNull().references(() => assessments.id, { onDelete: 'cascade' }),
        userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
        score: integer('score').notNull(),
        totalQuestions: integer('total_questions').notNull(),
        scorePercentage: real('score_percentage').notNull(),
        passed: boolean('passed').notNull(),
        submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (table) => ({
        oneAttemptPerUser: uniqueIndex('one_attempt_per_user_idx').on(table.assessmentId, table.userId),
    })
);

// ============================================================================
// ASSESSMENT SUBMISSION ANSWERS TABLE
// ============================================================================
export const assessmentSubmissionAnswers = pgTable('assessment_submission_answers', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    submissionId: integer('submission_id').notNull().references(() => assessmentSubmissions.id, { onDelete: 'cascade' }),
    questionId: integer('question_id').notNull().references(() => assessmentQuestions.id),
    selectedOptionId: integer('selected_option_id').notNull().references(() => assessmentOptions.id),
    isCorrect: boolean('is_correct').notNull(),
});

// ============================================================================
// TYPESCRIPT TYPES
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
export type LiveRoom = typeof liveRooms.$inferSelect;
export type NewLiveRoom = typeof liveRooms.$inferInsert;
export type CourseDocument = typeof courseDocuments.$inferSelect;
export type NewCourseDocument = typeof courseDocuments.$inferInsert;
export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;
export type AssessmentQuestion = typeof assessmentQuestions.$inferSelect;
export type NewAssessmentQuestion = typeof assessmentQuestions.$inferInsert;
export type AssessmentOption = typeof assessmentOptions.$inferSelect;
export type NewAssessmentOption = typeof assessmentOptions.$inferInsert;
export type AssessmentSubmission = typeof assessmentSubmissions.$inferSelect;
export type NewAssessmentSubmission = typeof assessmentSubmissions.$inferInsert;
export type AssessmentSubmissionAnswer = typeof assessmentSubmissionAnswers.$inferSelect;
export type NewAssessmentSubmissionAnswer = typeof assessmentSubmissionAnswers.$inferInsert;