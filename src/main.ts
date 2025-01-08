import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';

import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { studentsTable } from './database/schema';

const db = drizzle(process.env.DB_FILE_NAME!); // Initializes the database connection using Drizzle ORM

async function bootstrap() {
  // Logs the DB file path to check if it's correct

  const app = await NestFactory.create(AppModule); // Creates the NestJS app from the main module
  await app.listen(process.env.PORT ?? 5000); // Starts the app on the provided port or default to 5000
  console.log('Database file:', process.env.DB_FILE_NAME); 
}

bootstrap(); // Calls the bootstrap function to start the app
