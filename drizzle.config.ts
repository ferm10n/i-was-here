import { defineConfig } from 'drizzle-kit';
import { env } from './server/api/env.ts';

export default defineConfig({
  out: './server/db/drizzle-out',
  schema: './server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
