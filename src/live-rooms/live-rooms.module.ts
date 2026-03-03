// src/live-rooms/live-rooms.module.ts
import { Module } from '@nestjs/common';
import { LiveRoomsService } from './live-rooms.service';
import { LiveRoomsController } from './live-rooms.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    providers: [LiveRoomsService],
    controllers: [LiveRoomsController],
})
export class LiveRoomsModule {}