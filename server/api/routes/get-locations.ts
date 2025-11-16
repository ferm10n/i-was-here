import * as z from 'zod/v4';
import { defineEndpoint } from '../util.ts';
import { locations } from '../../db/schema.ts';
import { db } from '../../db/index.ts';
import { sql } from 'drizzle-orm';

export const getLocationsEndpoint = defineEndpoint({
  inputSchema: z.object({
    minLat: z.number().optional(),
    maxLat: z.number().optional(),
    minLng: z.number().optional(),
    maxLng: z.number().optional(),
  }).default({}),
  protected: true,
  handler: async (input) => {
    // If bounds are provided, use PostGIS bounding box query for efficiency
    if (input.minLat !== undefined && input.maxLat !== undefined &&
      input.minLng !== undefined && input.maxLng !== undefined) {

      // Use ST_MakeEnvelope for efficient spatial filtering
      // The && operator checks if bounding boxes overlap (much faster than ST_Within)
      const result = await db.select({
        id: locations.id,
        lat: locations.lat,
        lng: locations.lng,
      })
        .from(locations)
        .where(
          sql`geom && ST_MakeEnvelope(${input.minLng}, ${input.minLat}, ${input.maxLng}, ${input.maxLat}, 4326)`
        );

      return { locations: result };
    }

    // Fallback to fetching all locations if no bounds provided
    return {
      locations: await db.select({
        id: locations.id,
        lat: locations.lat,
        lng: locations.lng,
      }).from(locations),
    };
  },
});
