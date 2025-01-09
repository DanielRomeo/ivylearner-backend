import { Injectable } from '@nestjs/common';
import { DatabaseProvider } from '../database/database.provider'; // Import DatabaseProvider
// import { studentsTable } from '../database/schema'; // Import your table schema

export type Student = {
  id: number;
  firstName: string;
  lastName: string;
  profilePicture: string;
  bio: string;
  dateOfBirth: string;
  educationLevel: string;
  intrests: string;
  preferredLanguage: string;
};



@Injectable()
export class StudentsService {
  constructor(private readonly databaseProvider: DatabaseProvider) {}

  async getAllStudents() {
    // const db = this.databaseProvider.getDb(); // Get the db instance from the provider
    // try {
    //   const students = await db.select().from(studentsTable);
    //   return students;
    // } catch (error) {
    //   console.error('Error fetching students:', error);
    //   throw error;
    // }
  }

  // first I want to create a user and then the user:

  // async findOne(email: string): Promise<User | undefined> {
  //   return this.users.find((user) => user.email === email);
  // }
}
