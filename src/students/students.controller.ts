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

    // Controller to ...

    // Controller to create a student:

    // Controller to delete a student:

    // Controller to update a student:

    // Controller to get a student:

    // Controller to get all students enrolled to a course:

    // Controller to unenroll a student from a course: // This means I am going to have to create a linker table::::

    // Controller to enroll to a course:
}
