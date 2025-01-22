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
import { AuthService } from 'src/auth/auth.service';
import { CoursesService, CreateCourseDto } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
    constructor(
        private readonly coursesService: CoursesService,
    ){}
}
