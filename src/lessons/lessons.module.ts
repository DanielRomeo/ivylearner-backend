import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { DatabaseModule } from 'src/database/database.module';
import {CoursesModule} from '../courses/courses.module'
// import { InstructorsModule } from 'src/instructors/instructors.module';
// import { OrganisationsModule } from 'src/organisations/organisations.module';

@Module({
  imports: [DatabaseModule, CoursesModule],
  providers: [LessonsService],
  controllers: [LessonsController],
  exports: [LessonsService],
})
export class LessonsModule {}
