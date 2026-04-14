import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import dotenv from 'dotenv';

dotenv.config();

// Uses Neon's HTTP transport — no native binary required, works on all platforms
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
