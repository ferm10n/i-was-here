import * as z from "@zod/zod/v4";
import { defineEndpoint, locations$ } from '../util.ts';
import { locationInsertSchema, locations } from '../../db/schema.ts';
import { db } from '../../db/index.ts';

export const getLocationsEndpoint = defineEndpoint({
  inputSchema: z.object({
    minLat: z.number().optional(),
    maxLat: z.number().optional(),
    minLng: z.number().optional(),
    maxLng: z.number().optional(),
  }).default({}),
  handler: async (input) => {
    // try {

    // Build the where conditions array
    // const conditions: SQLWrapper[] = [];

    // if (input.minLat) {
    //   conditions.push()
    // }

    return {
      locations: await db.select({
        lat: locations.lat,
        lng: locations.lng,
      }).from(locations),
    };
    // }
  },
});
