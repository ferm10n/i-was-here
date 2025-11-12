import * as z from "@zod/zod/v4";
import { defineEndpoint } from '../util.ts';
import { locationInsertSchema, locations } from '../../db/schema.ts';
import { db } from '../../db/index.ts';
// locations
export const saveLocationEndpoint = defineEndpoint({
  inputSchema: locationInsertSchema,
  handler: async (input) => {
    console.log('Saving location', input);

    try {
      const data = await db
        .insert(locations)
        .values(input)
        .onConflictDoUpdate({ target: locations.id, set: input })

      console.log('location saved', data);
      return { ok: true };
    } catch (err) {
      console.error('failed to save location', err);
      return { ok: false };
    }
  },
});
