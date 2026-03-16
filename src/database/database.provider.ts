import { drizzle } from 'drizzle-orm/libsql';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { createClient } from '@libsql/client/.';

// The symbol for the provider
export const DRIZZLE_DB = 'DRIZZLE_DB';

@Injectable()
export class DatabaseProvider {
    private db: any;

    constructor(private readonly configService: ConfigService) {
        const dbFile = this.configService.get<string>('DB_FILE_NAME');
        const client = createClient({ url: `file:${dbFile}` }); // ← create client first
        this.db = drizzle(client); // ← then pass client to drizzle
    }

    getDb() {
        return this.db; // Return the DB instance
    }
}
