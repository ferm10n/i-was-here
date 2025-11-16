import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '../api/env.ts';

export const db = drizzle(env.DATABASE_URL);
