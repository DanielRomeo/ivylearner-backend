import { relations } from "drizzle-orm/relations";
import { course, courseProgress, user, enrollment, student, instructor, lesson, progress, organisation } from "./schema";

export const courseProgressRelations = relations(courseProgress, ({one}) => ({
	course: one(course, {
		fields: [courseProgress.courseId],
		references: [course.id]
	}),
	user: one(user, {
		fields: [courseProgress.userId],
		references: [user.id]
	}),
}));

export const courseRelations = relations(course, ({one, many}) => ({
	courseProgresses: many(courseProgress),
	enrollments: many(enrollment),
	lessons: many(lesson),
	progresses: many(progress),
	user: one(user, {
		fields: [course.createdBy],
		references: [user.id]
	}),
	organisation: one(organisation, {
		fields: [course.organisationId],
		references: [organisation.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	courseProgresses: many(courseProgress),
	instructors: many(instructor),
	progresses: many(progress),
	students: many(student),
	courses: many(course),
}));

export const enrollmentRelations = relations(enrollment, ({one}) => ({
	course: one(course, {
		fields: [enrollment.courseId],
		references: [course.id]
	}),
	student: one(student, {
		fields: [enrollment.studentId],
		references: [student.id]
	}),
}));

export const studentRelations = relations(student, ({one, many}) => ({
	enrollments: many(enrollment),
	user: one(user, {
		fields: [student.userId],
		references: [user.id]
	}),
}));

export const instructorRelations = relations(instructor, ({one, many}) => ({
	user: one(user, {
		fields: [instructor.userId],
		references: [user.id]
	}),
	organisations: many(organisation),
}));

export const lessonRelations = relations(lesson, ({one, many}) => ({
	course: one(course, {
		fields: [lesson.courseId],
		references: [course.id]
	}),
	progresses: many(progress),
}));

export const progressRelations = relations(progress, ({one}) => ({
	lesson: one(lesson, {
		fields: [progress.lessonId],
		references: [lesson.id]
	}),
	course: one(course, {
		fields: [progress.courseId],
		references: [course.id]
	}),
	user: one(user, {
		fields: [progress.userId],
		references: [user.id]
	}),
}));

export const organisationRelations = relations(organisation, ({one, many}) => ({
	instructor: one(instructor, {
		fields: [organisation.createdBy],
		references: [instructor.id]
	}),
	courses: many(course),
}));