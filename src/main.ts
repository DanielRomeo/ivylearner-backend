import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';

import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { studentsTable } from './database/schema';
  
const db = drizzle(process.env.DB_FILE_NAME!);


async function main() {
  const user: typeof studentsTable.$inferInsert = {
    name: 'John',
    age: 30,
    email: 'john@example.com',
  };
  await db.insert(studentsTable).values(user);
  console.log('New user created!')
  const users = await db.select().from(studentsTable);
  console.log('Getting all users from the database: ', users)
  /*
  const users: {
    id: number;
    name: string;
    age: number;
    email: string;
  }[]
  */
  await db
    .update(studentsTable)
    .set({
      age: 31,
    })
    .where(eq(studentsTable.email, user.email));
  console.log('User info updated!')
  // await db.delete(studentsTable).where(eq(studentsTable.email, user.email));
  // console.log('User deleted!')
}



async function bootstrap() {
  const db = drizzle(process.env.DB_FILE_NAME!);


  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 5000);
  main();
}
bootstrap();
