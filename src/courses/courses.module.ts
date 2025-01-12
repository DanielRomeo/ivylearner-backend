import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { DatabaseModule } from 'src/database/database.module';
import { InstructorsModule } from 'src/instructors/instructors.module';

@Module({
  imports: [DatabaseModule, InstructorsModule],
  providers: [CoursesService],
  controllers: [CoursesController],
  exports: [CoursesService],
})
export class CoursesModule {}
