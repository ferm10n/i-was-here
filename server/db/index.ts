import { drizzle } from 'drizzle-orm/neon-http';
const databaseUrl = Deno.env.get('DATABASE_URL');
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}
export const db = drizzle(databaseUrl);
