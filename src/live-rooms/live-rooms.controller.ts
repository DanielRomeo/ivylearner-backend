// src/live-rooms/live-rooms.controller.ts
import {
    Controller,
    Post,
    Get,
    Patch,
    Param,
    Body,
    ParseIntPipe,
    UseGuards,
    Request,
} from '@nestjs/common';

import { LiveRoomsService } from './live-rooms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

class CreateRoomDto {
    @IsNumber() courseId: number;
    @IsString() title: string;
}

// class CreateRoomDto {
//     @IsNumber() courseId: number;
//     @IsString() title: string;
// }

@ApiTags('Live Rooms')
@Controller('live-rooms')
export class LiveRoomsController {
    constructor(private readonly liveRoomsService: LiveRoomsService) {}

    /** Get instructor's own courses (for the course picker) */
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Get('my-courses')
    @ApiOperation({ summary: 'Get courses for the logged-in instructor' })
    getMyCourses(@Request() req: any) {
        // JWT strategy: req.user = { id: payload.sub, email: payload.name }
        return this.liveRoomsService.getCoursesByInstructor(req.user.id);
    }

    /** Create a live room */
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Post()
    @ApiOperation({ summary: 'Create a live room (instructor)' })
    create(@Request() req: any, @Body() dto: CreateRoomDto) {
        return this.liveRoomsService.createRoom(req.user.id, dto.courseId, dto.title);
    }

    /** Get a specific room */
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Get(':id')
    @ApiOperation({ summary: 'Get room by id' })
    getRoom(@Param('id', ParseIntPipe) id: number) {
        return this.liveRoomsService.getRoom(id);
    }

    /** List all rooms for a course */
    @Get('course/:courseId')
    @ApiOperation({ summary: 'List rooms for a course' })
    getRoomsForCourse(@Param('courseId', ParseIntPipe) courseId: number) {
        console.log(`Fetching rooms for course ${courseId}`);
        return this.liveRoomsService.getRoomsForCourse(courseId);
    }

    /** End a room */
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Patch(':id/end')
    @ApiOperation({ summary: 'End a live room (instructor)' })
    endRoom(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.liveRoomsService.endRoom(id, req.user.id);
    }
}