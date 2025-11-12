import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './server/db/drizzle-out',
  schema: './server/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: Deno.env.get('DATABASE_URL')!,
  },
});
