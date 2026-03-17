// src/database/database.provider.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

@Injectable()
export class DatabaseProvider {
    private db: ReturnType<typeof drizzle>;

    constructor(private readonly configService: ConfigService) {
        const databaseUrl = this.configService.get<string>('DATABASE_URL');

        if (!databaseUrl) {
            throw new Error('DATABASE_URL is not defined in environment variables');
        }

        const sql = neon(databaseUrl);
        this.db = drizzle(sql, { schema });
    }

    getDb() {
        return this.db;
    }
}