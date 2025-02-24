import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseProvider } from 'src/database/database.provider';
import { lesson, course } from '../database/schema'; // Ensure both schemas are imported
import { eq } from 'drizzle-orm';

@Injectable()
export class LessonsService {
  constructor(private readonly databaseProvider: DatabaseProvider) {}

  async createLesson(
    lessonData: {
      title: string;
      courseId: number;
      orderIndex: number;
      videoUrl: string;
    },
    userId: number,
  ) {
    const db = this.databaseProvider.getDb();

    // Ensure the user is authorized to add a lesson to the course
    const courseData = await db
      .select()
      .from(course) // `course` is properly declared and imported now
      .where(eq(course.id, lessonData.courseId))
      .limit(1)
      .then((res) => res[0]);

    if (!courseData) {
      throw new NotFoundException('Course not found');
    }
    if (courseData.createdBy !== userId) {
      throw new UnauthorizedException('You cannot add lessons to this course');
    }

    const [newLesson] = await db
      .insert(lesson)
      .values({ ...lessonData })
      .returning();

    return newLesson;
  }

  async getLesson(id: number) {
    const db = this.databaseProvider.getDb();

    const result = await db
      .select()
      .from(lesson)
      .where(eq(lesson.id, id))
      .limit(1)
      .then((res) => res[0]);

    if (!result) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return result;
  }

  async getLessonsByCourse(courseId: number) {
    const db = this.databaseProvider.getDb();

    const lessons = await db
      .select()
      .from(lesson)
      .where(eq(lesson.courseId, courseId))
      .orderBy(lesson.orderIndex)
      .all();

    return lessons;
  }

  async deleteLesson(id: number, userId: number) {
    const db = this.databaseProvider.getDb();

    const lessonData = await this.getLesson(id);

    // Ensure the user owns the lesson's course
    const courseData = await db
      .select()
      .from(course)
      .where(eq(course.id, lessonData.courseId))
      .limit(1)
      .then((res) => res[0]);

    if (!courseData || courseData.createdBy !== userId) {
      throw new UnauthorizedException('You cannot delete this lesson');
    }

    await db.delete(lesson).where(eq(lesson.id, id)).execute();
  }
}
