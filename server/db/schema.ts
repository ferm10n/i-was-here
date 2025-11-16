import {
  boolean,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  index,
  customType,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { InferSelectModel } from 'drizzle-orm/table';
import { sql } from 'drizzle-orm';

// Define PostGIS geometry type
const geometry = customType<{ data: unknown }>({
  dataType() {
    return 'geometry(Point, 4326)';
  },
});

export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  ts: timestamp('created_at').defaultNow().notNull(),
  lat: real().notNull(),
  lng: real().notNull(),
  // PostGIS geometry column - automatically populated via trigger
  geom: geometry('geom').notNull(),
  revisit: boolean().default(false),
  note: text(),
  created_by_name: text(),
  created_by_email: text(),
  accuracy: real(),
  address: text(),
}, (table) => {
  return {
    // Spatial index for efficient geographic queries
    geomIdx: index('locations_geom_idx').using('gist', sql`${table.geom}`),
  };
});

export const locationInsertSchema = createInsertSchema(locations);

export type Location = InferSelectModel<typeof locations>;
