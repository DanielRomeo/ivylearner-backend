import {
    integer,
    primaryKey,
    sqliteTable,
    text,
} from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').notNull(),
    lastLogin: integer('last_login', { mode: 'timestamp' }),
});

export const instructor = sqliteTable('instructor', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
        .notNull()
        .references(() => user.id),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    profilePicture: text('profile_picture'),
    bio: text('bio'),
    specialization: text('specialization'),
    yearsOfExperience: integer('years_of_experience', { mode: 'number' }),
    linkedinUrl: text('linkedin_url'),
    rating: integer('rating', { mode: 'number' }),
});

export const student = sqliteTable('student', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
        .notNull()
        .references(() => user.id),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    profilePicture: text('profile_picture'),
    bio: text('bio'),
    dateOfBirth: integer('date_of_birth', { mode: 'timestamp' }),
    educationLevel: text('education_level'),
    interests: text('interests'),
    preferredLanguage: text('preferred_language'),
});

export const organisation = sqliteTable('organisation', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
    shortDescription: text('short_description'),
    banner: text('banner'),
    logo: text('logo'),
    website: text('website'),
    email: text('email'),
    phone: text('phone'),
    address: text('address'),
    socialMedia: text('social_media'), // JSON string containing social media links
    verificationStatus: text('verification_status'),
    foundedYear: integer('founded_year', { mode: 'number' }),
    createdBy: integer('created_by')
        .notNull()
        .references(() => user.id),
});

export const course = sqliteTable('course', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    shortDescription: text('short_description').notNull(),
    description: text('description'),
    thumbnail: text('thumbnail'),
    price: integer('price', { mode: 'number' }),
    duration: integer('duration', { mode: 'number' }), // in minutes
    level: text('level'), // beginner, intermediate, advanced
    prerequisites: text('prerequisites'),
    objectives: text('objectives'),
    tags: text('tags'), // JSON array of strings
    language: text('language').notNull(),
    certificateAvailable: integer('certificate_available', { mode: 'boolean' }),
    featured: integer('featured', { mode: 'boolean' }),
    rating: integer('rating', { mode: 'number' }),
    enrollmentCount: integer('enrollment_count', { mode: 'number' }),
    publishStatus: text('publish_status'), // draft, published, archived
    publishedAt: integer('published_at', { mode: 'timestamp' }),
    lastUpdated: integer('last_updated', { mode: 'timestamp' }),
    organisationId: integer('organisation_id')
        .notNull()
        .references(() => organisation.id),
    createdBy: integer('created_by')
        .notNull()
        .references(() => user.id),
});

// this is the linking table between the course and the student:
export const enrollment = sqliteTable(
    'enrollment',
    {
        studentId: integer('student_id', { mode: 'number' })
            .notNull()
            .references(() => student.id),
        courseId: integer('course_id', { mode: 'number' })
            .notNull()
            .references(() => course.id),
        enrollmentDate: integer('enrollment_date', { mode: 'timestamp' }),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.studentId, table.courseId] }),
    }),
);

export const lesson = sqliteTable('lesson', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    content: text('content'),
    courseId: integer('course_id')
        .notNull()
        .references(() => course.id),
    orderIndex: integer('order_index', { mode: 'number' }).notNull(),
    duration: integer('duration', { mode: 'number' }), // in minutes
    type: text('type'), // video, text, quiz, etc.
    videoUrl: text('video_url'),
    attachments: text('attachments'), // JSON array of attachment URLs
});

export const progress = sqliteTable('progress', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
        .notNull()
        .references(() => user.id),
    courseId: integer('course_id')
        .notNull()
        .references(() => course.id),
    lessonId: integer('lesson_id').references(() => lesson.id),
    progress: integer('progress', { mode: 'number' }),
});

export const courseProgress = sqliteTable('course_progress', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
        .notNull()
        .references(() => user.id),
    courseId: integer('course_id')
        .notNull()
        .references(() => course.id),
    completionPercentage: integer('completion_percentage', {
        mode: 'number',
    }).notNull(),
    lastAccessed: integer('last_accessed', { mode: 'timestamp' }),
    certificateIssued: integer('certificate_issued', { mode: 'boolean' }),
    certificateIssuedAt: integer('certificate_issued_at', {
        mode: 'timestamp',
    }),
});
