import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';

import 'dotenv/config';
import { eq } from 'drizzle-orm';

const db = drizzle(process.env.DB_FILE_NAME!); // Initializes the database connection using Drizzle ORM

async function bootstrap() {
    // Logs the DB file path to check if it's correct

    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true, // Critical for query param parsing
            transformOptions: { enableImplicitConversion: true },
        }),
    );
    await app.listen(process.env.PORT ?? 5000);
    console.log('Database file:', process.env.DB_FILE_NAME);
    console.log('Database Path:', process.env.DATABASE_PATH);
}

bootstrap(); // Calls the bootstrap function to start the app
