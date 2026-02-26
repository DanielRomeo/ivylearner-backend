import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseProvider } from 'src/database/database.provider';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

export type User = {
    id?: number;
    email: string;
    password?: string;
    passwordHash?: string;
    firstName?: string;
    lastName?: string;
    role?: 'student' | 'instructor' | 'admin';
    createdAt?: Date;
    updatedAt?: Date;
};

@Injectable()
export class UsersService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    // Find one user by email
    async findOne(email: string): Promise<User | null> {
        const db = this.databaseProvider.getDb();
        const [userInfo] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));
        return userInfo ?? null;
    }

    // Find one user by ID
    async findById(id: number): Promise<User | null> {
        const db = this.databaseProvider.getDb();
        const [userInfo] = await db
            .select({
                id: users.id,
                email: users.email,
                role: users.role, // Explicitly selecting the role
            })
            .from(users)
            .where(eq(users.id, id));
        
        if (!userInfo) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        const { passwordHash, ...userWithoutPassword } = userInfo;
        return userWithoutPassword as User;
    }

    async updateMe(userId: number, data: { firstName?: string; lastName?: string; bio?: string }) {
        const db = this.databaseProvider.getDb();

        const [updated] = await db
            .update(users)
            .set({
                ...(data.firstName !== undefined && { firstName: data.firstName }),
                ...(data.lastName !== undefined && { lastName: data.lastName }),
                // bio is not yet in the new users table schema.
                // Add it to the schema first, then uncomment this:
                // ...(data.bio !== undefined && { bio: data.bio }),
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        if (!updated) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const { password, ...safeUser } = updated as any;
        return safeUser;
    }

    // Find user by ID (used by ME))
    async findByIdMe(id: number): Promise<User | null> {
        const db = this.databaseProvider.getDb();
        const [userInfo] = await db
            .select()
            .from(users)
            .where(eq(users.id, id));
        return userInfo ?? null;
    }

    // Find all users
    async findAll(): Promise<User[]> {
        const db = this.databaseProvider.getDb();
        const allUsers = await db.select().from(users);
        
        // Remove password hashes from all users
        return allUsers.map(user => {
            const { passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        });
    }

    // Create a user
    async create(userData: Partial<User>): Promise<User> {
        const db = this.databaseProvider.getDb();

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(userData.password || '', 10);

        const [newUser] = await db
            .insert(users)
            .values({
                email: userData.email!,
                passwordHash: hashedPassword,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role || 'student',
            })
            .returning();

        return newUser;
    }

    // Update a user
    async update(id: number, updateData: Partial<User>): Promise<User> {
        const db = this.databaseProvider.getDb();

        // Check if user exists
        await this.findById(id);

        // Prepare update data
        const dataToUpdate: any = {
            updatedAt: new Date(),
        };

        if (updateData.email) dataToUpdate.email = updateData.email;
        if (updateData.firstName) dataToUpdate.firstName = updateData.firstName;
        if (updateData.lastName) dataToUpdate.lastName = updateData.lastName;
        if (updateData.role) dataToUpdate.role = updateData.role;
        
        // Hash password if provided
        if (updateData.password) {
            dataToUpdate.passwordHash = await bcrypt.hash(updateData.password, 10);
        }

        const [updatedUser] = await db
            .update(users)
            .set(dataToUpdate)
            .where(eq(users.id, id))
            .returning();

        const { passwordHash, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword as User;
    }

    // Delete a user
    async remove(id: number): Promise<void> {
        const db = this.databaseProvider.getDb();

        // Check if user exists
        await this.findById(id);

        await db.delete(users).where(eq(users.id, id));
    }
}