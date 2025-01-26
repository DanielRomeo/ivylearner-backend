import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpStatus,
    ParseIntPipe,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
    HttpException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CoursesService } from '../courses/courses.service';
import { LessonsService } from './lessons.service';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
    constructor(
        private readonly coursesService: CoursesService,
        private readonly lessonsService: LessonsService,
    ) {}

    // get one lesson:

    // get all lessons in a course:

    // delete one lessons:

    // create a lesson:
}
