import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import {DatabaseModule} from '../database/database.module'
import {CoursesModule} from '../courses/courses.module'

@Module({
  imports: [DatabaseModule, CoursesModule],
  providers: [LessonsService],
  controllers: [LessonsController],
  exports: [LessonsService],
})
export class LessonsModule {}
