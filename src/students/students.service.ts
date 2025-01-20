import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../database/database.provider'; // Import DatabaseProvider
// import { studentsTable } from '../database/schema'; // Import your table schema
import { user, instructor , student} from '../database/schema'; // notice it's singular 'user', not 'users'
import { eq } from 'drizzle-orm';
import {StudentType, StudentUser} from '../interfaces/student.interface' // Instructor type



export type Student = {
    id: number;
    studentId: number;
    firstName: string;
    lastName: string;
    profilePicture: string;
    bio: string;
    dateOfBirth: string;
    educationLevel: string;
    intrests: string;
    preferredLanguage: string;
};

// export type StudentUser = {
//     id: number;
//     studentId: number;
//     firstName: string;
//     lastName: string;
//     profilePicture: string;
//     bio: string;
//     dateOfBirth: string;
//     educationLevel: string;
//     intrests: string;
//     preferredLanguage: string;
// };

@Injectable()
export class StudentsService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

     // find one student: // only used by the student service only
     protected async findOne(userId: number): Promise<Student | null> {
        const db = this.databaseProvider.getDb();
        const [studentInfo] = await db
            .select()
            .from(student)
            .where(eq(student.userId, userId));
        return studentInfo ?? null;
    }

     // public, find one student:
     async findOneStudent(id: number): Promise<Student | null> {
        const db = this.databaseProvider.getDb();
        const [studentInfo] = await db
            .select()
            .from(student)
            .where(eq(student.id, id));
        return studentInfo ?? null;
    }

    // find if main Id exists in student table:
    async findCriminalStudent(id: number): Promise<Student | null> {
        const db = this.databaseProvider.getDb();
        const [studentInfo] = await db
            .select()
            .from(student)
            .where(eq(student.userId, id));
        return studentInfo ?? null;
    }

    // create a student:
    async create(studentData: StudentUser): Promise<StudentUser> {
    const db = this.databaseProvider.getDb();

    const [newStudent] = await db
        .insert(student)
        .values({
            userId : studentData.userId,
            email: studentData.email,
            password: studentData.password,
            firstName: studentData.firstName,
            lastName: studentData.lastName
        })
        .returning();

    return newStudent;
    }

    async getAllStudents() {
        // const db = this.databaseProvider.getDb(); // Get the db instance from the provider
        // try {
        //   const students = await db.select().from(studentsTable);
        //   return students;
        // } catch (error) {
        //   console.error('Error fetching students:', error);
        //   throw error;
        // }
    }

    // first I want to create a user and then the user:

    // async findOne(email: string): Promise<User | undefined> {
    //   return this.users.find((user) => user.email === email);
    // }
}
