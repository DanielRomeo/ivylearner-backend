import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../database/database.provider'; // Import DatabaseProvider
import { studentsTable } from '../database/schema'; // Import your table schema

@Injectable()
export class StudentsService {
  constructor(private readonly databaseProvider: DatabaseProvider) {}

  async getAllStudents() {
    const db = this.databaseProvider.getDb(); // Get the db instance from the provider
    try {
      const students = await db.select().from(studentsTable);
      return students;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }
}
