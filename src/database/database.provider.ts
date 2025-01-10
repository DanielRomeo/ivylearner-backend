import { drizzle } from 'drizzle-orm/libsql';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

// The symbol for the provider
export const DRIZZLE_DB = 'DRIZZLE_DB';

@Injectable()
export class DatabaseProvider {
    private db: any;

    constructor(private readonly configService: ConfigService) {
        const dbFile = this.configService.get<string>('DB_FILE_NAME');
        this.db = drizzle(dbFile!); // Initialize the DB connection
    }

    getDb() {
        return this.db; // Return the DB instance
    }
}
