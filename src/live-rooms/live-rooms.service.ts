// src/live-rooms/live-rooms.service.ts
import { Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { DatabaseProvider } from '../database/database.provider';
import { liveRooms, courses } from '../database/schema';
import { eq, and } from 'drizzle-orm';

const DAILY_API = 'https://api.daily.co/v1';

@Injectable()
export class LiveRoomsService implements OnModuleInit {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    onModuleInit() {
        if (!process.env.DAILY_API_KEY) {
            console.warn(
                '\n⚠️  WARNING: DAILY_API_KEY is not set.\n' +
                '   Add it to your .env and restart the backend.\n' +
                '   Get your key at https://dashboard.daily.co/developers\n'
            );
        } else {
            console.log('✅  Daily.co API key loaded.');
        }
    }

    private get dailyHeaders() {
        const key = process.env.DAILY_API_KEY;
        if (!key) {
            throw new InternalServerErrorException(
                'DAILY_API_KEY is not configured. Add it to your .env and restart.'
            );
        }
        return {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
        };
    }

    // ── Verify course belongs to this instructor ───────────────────
    private async verifyCourseOwnership(courseId: number, userId: number) {
        const db = this.databaseProvider.getDb();

        // The original schema: course.createdBy → user.id
        const [found] = await db
            .select({ id: courses.id, title: courses.title })
            .from(courses)
            .where(
                and(
                    eq(courses.id, courseId),
                    eq(courses.createdByUserId, userId)  // createdBy is user.id in original schema
                )
            );

        if (!found) {
            throw new NotFoundException(
                `Course ${courseId} not found or you don't have permission to host it.`
            );
        }

        return found;
    }

    // ── Get all courses for an instructor (by user.id) ─────────────
    async getCoursesByInstructor(userId: number) {
        const db = this.databaseProvider.getDb();
        return db
            .select({
                id: courses.id,
                title: courses.title,
                thumbnail: courses.thumbnailUrl,
                publishStatus: courses.isPublished,
            })
            .from(courses)
            .where(eq(courses.createdByUserId, userId));
    }

    // ── Create a new room ──────────────────────────────────────────
    async createRoom(userId: number, courseId: number, title: string) {
        // 1. Verify the instructor actually owns this course (prevents FK violation)
        await this.verifyCourseOwnership(courseId, userId);

        // 2. Create room on Daily.co
        const roomName = `ivylearner-${courseId}-${Date.now()}`;

        const dailyRes = await fetch(`${DAILY_API}/rooms`, {
            method: 'POST',
            headers: this.dailyHeaders,
            body: JSON.stringify({
                name: roomName,
                privacy: 'public',
                properties: {
                    max_participants: 200,
                    enable_screenshare: true,
                    enable_chat: true,
                    start_video_off: false,
                    start_audio_off: false,
                    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 6,
                },
            }),
        });

        if (!dailyRes.ok) {
            const errBody = await dailyRes.text();
            console.error('Daily.co error:', dailyRes.status, errBody);
            throw new InternalServerErrorException(
                `Daily.co error (${dailyRes.status}): ${errBody}`
            );
        }

        const dailyRoom = await dailyRes.json();

        // 3. Save to DB — using instructorUserId (→ user.id) and courseId (→ course.id)
        const db = this.databaseProvider.getDb();
        const [room] = await db
            .insert(liveRooms)
            .values({
                courseId,
                instructorUserId: userId,  // user.id, not instructor.id
                title,
                dailyRoomName: dailyRoom.name,
                dailyRoomUrl: dailyRoom.url,
                status: 'active',
                createdAt: Math.floor(Date.now() / 1000),
            })
            .returning();

        return room;
    }

    // ── Get a single room ──────────────────────────────────────────
    async getRoom(roomId: number) {
        const db = this.databaseProvider.getDb();
        const [room] = await db
            .select()
            .from(liveRooms)
            .where(eq(liveRooms.id, roomId));

        if (!room) throw new NotFoundException('Room not found');
        return room;
    }

    // ── Get rooms for a course ─────────────────────────────────────
    async getRoomsForCourse(courseId: number) {
        const db = this.databaseProvider.getDb();
        return db
            .select()
            .from(liveRooms)
            .where(eq(liveRooms.courseId, courseId));
    }

    // ── End a room ────────────────────────────────────────────────
    async endRoom(roomId: number, userId: number) {
        const db = this.databaseProvider.getDb();
        const [room] = await db
            .select()
            .from(liveRooms)
            .where(eq(liveRooms.id, roomId));

        if (!room) throw new NotFoundException('Room not found');

        // Delete from Daily.co
        const deleteRes = await fetch(`${DAILY_API}/rooms/${room.dailyRoomName}`, {
            method: 'DELETE',
            headers: this.dailyHeaders,
        });

        if (!deleteRes.ok) {
            console.warn('Daily.co delete warning:', await deleteRes.text());
        }

        const [updated] = await db
            .update(liveRooms)
            .set({ status: 'ended', endedAt: Math.floor(Date.now() / 1000) })
            .where(eq(liveRooms.id, roomId))
            .returning();

        return updated;
    }
}