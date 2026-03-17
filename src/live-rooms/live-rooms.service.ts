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
        if (!key) throw new InternalServerErrorException('DAILY_API_KEY is not configured.');
        return {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
        };
    }

    private async verifyCourseOwnership(courseId: number, userId: number) {
        const db = this.databaseProvider.getDb();
        const [found] = await db
            .select({ id: courses.id, title: courses.title })
            .from(courses)
            .where(and(eq(courses.id, courseId), eq(courses.createdByUserId, userId)));
        if (!found) throw new NotFoundException(`Course ${courseId} not found or you don't have permission to host it.`);
        return found;
    }

    async getCoursesByInstructor(userId: number) {
        const db = this.databaseProvider.getDb();
        return db
            .select({ id: courses.id, title: courses.title, thumbnail: courses.thumbnailUrl, publishStatus: courses.isPublished })
            .from(courses)
            .where(eq(courses.createdByUserId, userId));
    }

    async createRoom(userId: number, courseId: number, title: string) {
        await this.verifyCourseOwnership(courseId, userId);

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
                    // Daily.co exp still needs Unix timestamp — this is sent to Daily's API, not stored in Postgres
                    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 6,
                },
            }),
        });

        if (!dailyRes.ok) {
            const errBody = await dailyRes.text();
            throw new InternalServerErrorException(`Daily.co error (${dailyRes.status}): ${errBody}`);
        }

        const dailyRoom = await dailyRes.json();

        const db = this.databaseProvider.getDb();
        const [room] = await db
            .insert(liveRooms)
            .values({
                courseId,
                instructorUserId: userId,
                title,
                dailyRoomName: dailyRoom.name,
                dailyRoomUrl: dailyRoom.url,
                status: 'active',
                // FIX: Postgres timestamp expects Date object, not Unix number
                createdAt: new Date(),
            })
            .returning();

        return room;
    }

    async getRoom(roomId: number) {
        const db = this.databaseProvider.getDb();
        const [room] = await db.select().from(liveRooms).where(eq(liveRooms.id, roomId));
        if (!room) throw new NotFoundException('Room not found');
        return room;
    }

    async getRoomsForCourse(courseId: number) {
        const db = this.databaseProvider.getDb();
        return db.select().from(liveRooms).where(eq(liveRooms.courseId, courseId));
    }

    async endRoom(roomId: number, userId: number) {
        const db = this.databaseProvider.getDb();
        const [room] = await db.select().from(liveRooms).where(eq(liveRooms.id, roomId));
        if (!room) throw new NotFoundException('Room not found');

        const deleteRes = await fetch(`${DAILY_API}/rooms/${room.dailyRoomName}`, {
            method: 'DELETE',
            headers: this.dailyHeaders,
        });
        if (!deleteRes.ok) console.warn('Daily.co delete warning:', await deleteRes.text());

        const [updated] = await db
            .update(liveRooms)
            // FIX: Postgres timestamp expects Date object, not Unix number
            .set({ status: 'ended', endedAt: new Date() })
            .where(eq(liveRooms.id, roomId))
            .returning();

        return updated;
    }
}