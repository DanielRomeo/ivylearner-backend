import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from 'src/database/database.provider';
import { users, userProfiles } from '../database/schema';
import { eq } from 'drizzle-orm';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserProfilesService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    async getProfile(userId: number) {
        const db = this.databaseProvider.getDb();

        const [result] = await db
            .select({
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                role: users.role,
                createdAt: users.createdAt,
                // These come from user_profiles (may be null if no row exists yet)
                profilePictureUrl: userProfiles.profilePictureUrl,
                timezone: userProfiles.timezone,
                country: userProfiles.country,
                bio: userProfiles.bio,
                customData: userProfiles.customData,
                updatedAt: userProfiles.updatedAt,
            })
            .from(users)
            .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
            .where(eq(users.id, userId));

        return result ?? null;
    }

    async upsertProfile(userId: number, dto: UpdateProfileDto) {
        const db = this.databaseProvider.getDb();

        // SQLite/libSQL cannot receive `undefined` — always use null as fallback
        const safeProfilePictureUrl = dto.profilePictureUrl ?? null;
        const safeTimezone = dto.timezone ?? 'Africa/Johannesburg';
        const safeCountry = dto.country ?? 'ZA';
        const safeBio = dto.bio ?? null;
        const safeCustomData = dto.customData ?? null;

        // Check if a profile row already exists for this user
        const [existing] = await db
            .select({ userId: userProfiles.userId })
            .from(userProfiles)
            .where(eq(userProfiles.userId, userId));

        if (existing) {
            // Build update object — only include fields that were actually provided
            const updateValues: Record<string, any> = {
                updatedAt: new Date(),
            };

            if (dto.profilePictureUrl !== undefined) updateValues.profilePictureUrl = safeProfilePictureUrl;
            if (dto.timezone !== undefined) updateValues.timezone = safeTimezone;
            if (dto.country !== undefined) updateValues.country = safeCountry;
            if (dto.bio !== undefined) updateValues.bio = safeBio;
            if (dto.customData !== undefined) updateValues.customData = safeCustomData;

            const [updated] = await db
                .update(userProfiles)
                .set(updateValues)
                .where(eq(userProfiles.userId, userId))
                .returning();

            return updated;
        } else {
            // INSERT — create the row for the first time
            const [created] = await db
                .insert(userProfiles)
                .values({
                    userId,
                    profilePictureUrl: safeProfilePictureUrl,
                    timezone: safeTimezone,
                    country: safeCountry,
                    bio: safeBio,
                    customData: safeCustomData,
                    updatedAt: new Date(),
                })
                .returning();

            return created;
        }
    }
}