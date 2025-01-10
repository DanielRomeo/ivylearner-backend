import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from 'src/database/database.provider';
import { user } from '../database/schema'; // notice it's singular 'user', not 'users'
import { eq } from 'drizzle-orm';

export type User = {
    id?: number;
    name?: string;
    email: string;
    password: string;
    role?: string;
};

@Injectable()
export class UsersService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    // private readonly users: User[] = [
    //   {
    //     id: 1,
    //     name: 'Marius',
    //     email: 'marius@gmai.com',
    //     password: 'sosecure',
    //   },
    //   {
    //     id: 1,
    //     name: 'Daniel',
    //     email: 'daniel@gmail.com',
    //     password: 'password',
    //   },
    //   {
    //     id: 1,
    //     name: 'Romeo',
    //     email: 'romeo@gmail.com',
    //     password: 'password',
    //   },
    // ];

    // find one user:
    async findOne(email: string): Promise<User | null> {
        const db = this.databaseProvider.getDb();
        const [userInfo] = await db
            .select()
            .from(user)
            .where(eq(user.email, email));
        return userInfo ?? null;
    }

    // create a user:
    async create(userData: User): Promise<User> {
        const db = this.databaseProvider.getDb();

        const [newUser] = await db
            .insert(user)
            .values({
                email: userData.email,
                password: userData.password,
                role: userData.role || 'student',
            })
            .returning();

        return newUser;
    }
}
