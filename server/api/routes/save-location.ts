import { defineEndpoint, locations$ } from '../util.ts';
import { locationInsertSchema, locations } from '../../db/schema.ts';
import { db } from '../../db/index.ts';

// locations
export const saveLocationEndpoint = defineEndpoint({
  inputSchema: locationInsertSchema,
  protected: true,
  handler: async (input) => {
    console.log('Saving location', input);

    try {
      const data = await db
        .insert(locations)
        .values(input)
        .onConflictDoUpdate({ target: locations.id, set: input })
        .returning();

      locations$.next(data[0]);

      console.log('location saved', data[0]);
      return { ok: true, data };
    } catch (err) {
      console.error('failed to save location', err);
      return { ok: false };
    }
  },
});
