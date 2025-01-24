import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from 'src/database/database.provider';
import { user, instructor } from '../database/schema'; // notice it's singular 'user', not 'users'
import { eq } from 'drizzle-orm';
import {Instructor, InstructorUser} from '../interfaces/instructor.interface' // Instructor type



@Injectable()
export class InstructorsService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    // find one instructor: // only used by the instructor service only
    protected async findOne(userId: number): Promise<Instructor | null> {
        const db = this.databaseProvider.getDb();
        const [instructorInfo] = await db
            .select()
            .from(instructor)
            .where(eq(instructor.userId, userId));
        return instructorInfo ?? null;
    }

    // public, find one instructor:
    async findOneInstructor(id: number): Promise<Instructor | null> {
        const db = this.databaseProvider.getDb();
        const [instructorInfo] = await db
            .select()
            .from(instructor)
            .where(eq(instructor.userId, id));
        return instructorInfo ?? null;
    }

    async getInstructorIdGivenInstructorUser_id(user_id: number): Promise<number | null>{
        const db = this.databaseProvider.getDb();
        const [instructorInfo] = await db
            .select()
            .from(instructor)
            .where(eq(instructor.userId, user_id));
        return instructorInfo.id ?? null;
    }

     // find if main Id exists in student table:
     async findCriminalInstructor(id: number): Promise<Instructor | null> {
        const db = this.databaseProvider.getDb();
        const [instructorInfo] = await db
            .select()
            .from(instructor)
            .where(eq(instructor.userId, id));
        return instructorInfo ?? null;
    }

    // create an instructor:
    async create(instructorData: InstructorUser): Promise<InstructorUser> {
        const db = this.databaseProvider.getDb();

        const [newInstructor] = await db
            .insert(instructor)
            .values({
                userId : instructorData.userId,
                email: instructorData.email,
                password: instructorData.password,
                firstName: instructorData.firstName,
                lastName: instructorData.lastName
            })
            .returning();

        return newInstructor;
    }
}
