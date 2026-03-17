// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from 'src/database/database.provider';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    async findOne(email: string) {
        const db = this.databaseProvider.getDb();
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user ?? null;
    }

    async findByGoogleId(googleId: string) {
        const db = this.databaseProvider.getDb();
        const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
        return user ?? null;
    }

    async findById(id: number) {
        const db = this.databaseProvider.getDb();
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user ?? null;
    }

    async findAll() {
        const db = this.databaseProvider.getDb();
        return db.select().from(users);
    }

    // Local user creation
    async create(userData: {
        email: string;
        password: string;
        role?: 'student' | 'instructor' | 'admin';
    }) {
        const db = this.databaseProvider.getDb();
        const [newUser] = await db
            .insert(users)
            .values({
                email: userData.email,
                passwordHash: userData.password,
                role: userData.role ?? 'student',
                authProvider: 'local',
            })
            .returning();
        return newUser;
    }

    // Google user creation
    async createGoogleUser(googleUser: {
        googleId: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl: string;
        googleAccessToken: string;
    }) {
        const db = this.databaseProvider.getDb();
        const [newUser] = await db
            .insert(users)
            .values({
                email: googleUser.email,
                firstName: googleUser.firstName,
                lastName: googleUser.lastName,
                googleId: googleUser.googleId,
                googleAccessToken: googleUser.googleAccessToken,
                avatarUrl: googleUser.avatarUrl,
                authProvider: 'google',
                passwordHash: null,
                role: 'student',
            })
            .returning();
        return newUser;
    }

    // Update Google tokens on every Google login to keep them fresh
    async updateGoogleTokens(
        userId: number,
        data: { googleId: string; googleAccessToken: string; avatarUrl: string },
    ) {
        const db = this.databaseProvider.getDb();
        const [updatedUser] = await db
            .update(users)
            .set({
                googleId: data.googleId,
                googleAccessToken: data.googleAccessToken,
                avatarUrl: data.avatarUrl,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();
        return updatedUser;
    }

    async update(id: number, updateData: Partial<{ email: string; firstName: string; lastName: string; role: 'student' | 'instructor' | 'admin' }>) {
        const db = this.databaseProvider.getDb();
        const [updated] = await db
            .update(users)
            .set({ ...updateData, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return updated;
    }

    async updateMe(id: number, data: { firstName?: string; lastName?: string; bio?: string }) {
        const db = this.databaseProvider.getDb();
        const [updated] = await db
            .update(users)
            .set({
                firstName: data.firstName,
                lastName: data.lastName,
                updatedAt: new Date(),
            })
            .where(eq(users.id, id))
            .returning();
        return updated;
    }

    async remove(id: number) {
        const db = this.databaseProvider.getDb();
        await db.delete(users).where(eq(users.id, id));
    }
}