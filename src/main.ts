import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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
        // origin: ['https://ivylearner.netlify.app', 'http://localhost:3000', 'https://ivylearner-backend.onrender.com'], // Allow requests only from this frontend
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
        allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
       //credentials: true, // If you are using cookies or authentication // will have to switch this back on when going production
       // and that will mean the frontend will have to send every request with a:
       //axios.get('https://your-live-backend.com/api/some-route', { withCredentials: true });  <- That credentials object... for every frontend endpoint

    });

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

        // Swagger configuration
        const config = new DocumentBuilder()
            .setTitle('IvyLearner LMS API')
            .setDescription('Learning Management System API Documentation')
            .setVersion('2.0')
            .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT-auth',
            )
            .addTag('Auth', 'Authentication endpoints')
            .addTag('Users', 'User management endpoints')
            .addTag('Organizations', 'Organization management endpoints')
            .addTag('Courses', 'Course management endpoints')
            .addTag('Enrollments', 'Enrollment management endpoints')
            .addTag('Lessons', 'Lesson management endpoints')
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
            },
        });

    await app.listen(process.env.PORT ?? 5000);
    console.log('Server running on port:', process.env.PORT ?? 5000);
}

bootstrap();
