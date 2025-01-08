import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { DatabaseModule } from '../database/database.module'; // Import the DatabaseModule

@Module({
  //imports: [DatabaseModule],  // Add DatabaseModule here
  imports: [DatabaseModule], // Add DatabaseModule here to use its providers

  providers: [StudentsService],
  controllers: [StudentsController],
})
export class StudentsModule {}
