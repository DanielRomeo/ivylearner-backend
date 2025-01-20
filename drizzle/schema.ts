import { sqliteTable, AnySQLiteColumn, foreignKey, integer, primaryKey, text, uniqueIndex } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const courseProgress = sqliteTable("course_progress", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	userId: integer("user_id").notNull().references(() => user.id),
	courseId: integer("course_id").notNull().references(() => course.id),
	completionPercentage: integer("completion_percentage").notNull(),
	lastAccessed: integer("last_accessed"),
	certificateIssued: integer("certificate_issued"),
	certificateIssuedAt: integer("certificate_issued_at"),
});

export const enrollment = sqliteTable("enrollment", {
	studentId: integer("student_id").notNull().references(() => student.id),
	courseId: integer("course_id").notNull().references(() => course.id),
	enrollmentDate: integer("enrollment_date"),
},
(table) => [
	primaryKey({ columns: [table.studentId, table.courseId], name: "enrollment_student_id_course_id_pk"})
]);

export const instructor = sqliteTable("instructor", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	userId: integer("user_id").notNull().references(() => user.id),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	profilePicture: text("profile_picture"),
	bio: text(),
	specialization: text(),
	yearsOfExperience: integer("years_of_experience"),
	linkedinUrl: text("linkedin_url"),
	rating: integer(),
});

export const lesson = sqliteTable("lesson", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	title: text().notNull(),
	content: text(),
	courseId: integer("course_id").notNull().references(() => course.id),
	orderIndex: integer("order_index").notNull(),
	duration: integer(),
	type: text(),
	videoUrl: text("video_url"),
	attachments: text(),
});

export const progress = sqliteTable("progress", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	userId: integer("user_id").notNull().references(() => user.id),
	courseId: integer("course_id").notNull().references(() => course.id),
	lessonId: integer("lesson_id").references(() => lesson.id),
	progress: integer(),
});

export const student = sqliteTable("student", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	userId: integer("user_id").notNull().references(() => user.id),
	firstName: text("first_name").notNull(),
	lastName: text("last_name").notNull(),
	profilePicture: text("profile_picture"),
	bio: text(),
	dateOfBirth: integer("date_of_birth"),
	educationLevel: text("education_level"),
	interests: text(),
	preferredLanguage: text("preferred_language"),
});

export const user = sqliteTable("user", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	email: text().notNull(),
	password: text().notNull(),
	role: text().notNull(),
	lastLogin: integer("last_login"),
},
(table) => [
	uniqueIndex("user_email_unique").on(table.email),
]);

export const organisation = sqliteTable("organisation", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	name: text().notNull(),
	description: text(),
	shortDescription: text("short_description"),
	banner: text(),
	logo: text(),
	website: text(),
	email: text(),
	phone: text(),
	address: text(),
	socialMedia: text("social_media"),
	verificationStatus: text("verification_status"),
	foundedYear: integer("founded_year"),
	createdBy: integer("created_by").notNull().references(() => instructor.id),
});

export const course = sqliteTable("course", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	title: text().notNull(),
	shortDescription: text("short_description").notNull(),
	description: text(),
	thumbnail: text(),
	price: integer(),
	duration: integer(),
	level: text(),
	prerequisites: text(),
	objectives: text(),
	tags: text(),
	language: text(),
	certificateAvailable: integer("certificate_available"),
	featured: integer(),
	rating: integer(),
	enrollmentCount: integer("enrollment_count"),
	publishStatus: text("publish_status"),
	publishedAt: integer("published_at"),
	lastUpdated: integer("last_updated"),
	organisationId: integer("organisation_id").notNull().references(() => organisation.id),
	createdBy: integer("created_by").notNull().references(() => user.id),
});

export const drizzleMigrations = sqliteTable("__drizzle_migrations", {
});

