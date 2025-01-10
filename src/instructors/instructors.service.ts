import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from 'src/database/database.provider';
import { user } from '../database/schema'; // notice it's singular 'user', not 'users'
import { eq } from 'drizzle-orm';
import {Instructor} from '../interfaces/instructor.interface' // Instructor type

@Injectable()
export class InstructorsService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    // find one instructor:
    // async findOne(email: string): Promise<Instructor | null> {
    //     const db = this.databaseProvider.getDb();
    //     const [instructorInfo] = await db
    //         .select()
    //         .from(user)
    //         .where(eq(user.email, email));
    //     return instructorInfo ?? null;
    // }

    // create an instructor:
    async create(instructorData: Instructor): Promise<Instructor> {
        const db = this.databaseProvider.getDb();

        const [newInstructor] = await db
            .insert(instructor)
            .values({
                email: instructorData.email,
                password: instructorData.password,
                role: instructorData.role || 'student',
            })
            .returning();

        return newInstructor;
    }
}
