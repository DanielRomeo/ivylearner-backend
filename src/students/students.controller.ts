import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  async findAll() {
    try {
      console.log('we got passed this phase');
      return this.studentsService.getAllStudents();
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error; // or handle appropriately
    }
  }
}
