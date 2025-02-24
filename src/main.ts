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
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    await app.listen(process.env.PORT ?? 5000);
    console.log('Server running on port:', process.env.PORT ?? 5000);
}

bootstrap();
