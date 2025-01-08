import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

// Initialize SQLite connection
const sqlite = new Database('students.db');
export const db = drizzle(sqlite);
