import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import 'dotenv/config';

const dbFileName = process.env.DB_FILE_NAME;

if (!dbFileName) {
    throw new Error('DB_FILE_NAME is not defined in environment variables');
}

const client = createClient({
    url: `file:${dbFileName}`,
});

const db = drizzle(client);

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: ['https://ivylearner.netlify.app', 'http://localhost:3000'], // Allow requests only from this frontend
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
        allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
        credentials: true, // If you are using cookies or authentication
    });

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    await app.listen(process.env.PORT ?? 5000);
    console.log('Server running on port:', process.env.PORT ?? 5000);
}

bootstrap();
