import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DatabaseProvider } from '../database/database.provider';
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
};

@Injectable()
export class UsersService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    /**
     * Find one user by email (includes password for authentication)
     */
    async findOne(email: string): Promise<any> {
        const db = this.databaseProvider.getDb();
        const [userInfo] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));
        return userInfo ?? null;
    }

    /**
     * Find user by ID (without password)
     */
    async findById(id: number): Promise<any> {
        const db = this.databaseProvider.getDb();
        const [user] = await db.select().from(users).where(eq(users.id, id));

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * Find all users (without passwords)
     */
    async findAll(): Promise<any[]> {
        const db = this.databaseProvider.getDb();
        const allUsers = await db.select().from(users);

        return allUsers.map(({ passwordHash, ...user }) => user);
    }

    /**
     * Create a new user
     */
    async create(userData: User): Promise<any> {
        const db = this.databaseProvider.getDb();

        // Check if user already exists
        const existingUser = await this.findOne(userData.email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(
            userData.password || 'defaultPassword',
            10,
        );

        const [newUser] = await db
            .insert(users)
            .values({
                email: userData.email,
                passwordHash: passwordHash,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role || 'student',
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        const { passwordHash: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    /**
     * Update user
     */
    async update(id: number, updateData: Partial<User>): Promise<any> {
        const db = this.databaseProvider.getDb();

        // Check if user exists
        await this.findById(id);

        // If email is being updated, check for conflicts
        if (updateData.email) {
            const existingUser = await this.findOne(updateData.email);
            if (existingUser && existingUser.id !== id) {
                throw new ConflictException('Email already in use');
            }
        }

        // Prepare update data
        const updatePayload: any = {
            ...updateData,
            updatedAt: new Date(),
        };

        // If password is being updated, hash it
        if (updateData.password) {
            updatePayload.passwordHash = await bcrypt.hash(updateData.password, 10);
            delete updatePayload.password;
        }

        const [updatedUser] = await db
            .update(users)
            .set(updatePayload)
            .where(eq(users.id, id))
            .returning();

        const { passwordHash, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }

    /**
     * Delete user
     */
    async remove(id: number): Promise<void> {
        const db = this.databaseProvider.getDb();
        await this.findById(id); // Check if exists
        await db.delete(users).where(eq(users.id, id));
    }

    /**
     * Validate user credentials for login
     */
    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.findOne(email);

        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return null;
        }

        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}