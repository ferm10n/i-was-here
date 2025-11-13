import {
  boolean,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { InferSelectModel } from 'drizzle-orm/table';

export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  ts: timestamp('created_at').defaultNow().notNull(),
  lat: real().notNull(),
  lng: real().notNull(),
  revisit: boolean().default(false),
  note: text(),
  created_by_name: text(),
  created_by_email: text(),
  accuracy: real(),
  address: text(),
});

export const locationInsertSchema = createInsertSchema(locations);

export type Location = InferSelectModel<typeof locations>;
