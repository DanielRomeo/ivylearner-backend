// drizzle.config.ts (root of project)
import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/database/schema.ts',
    out: './drizzle',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    verbose: true,
    strict: true,
});