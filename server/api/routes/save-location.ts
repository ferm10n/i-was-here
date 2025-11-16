import { defineEndpoint, locations$ } from '../util.ts';
import { locationInsertSchema, locations } from '../../db/schema.ts';
import { db } from '../../db/index.ts';

// locations
export const saveLocationEndpoint = defineEndpoint({
  inputSchema: locationInsertSchema,
  protected: true,
  handler: async (input, _req, user) => {
    console.log('Saving location', input);

    try {
      const data = await db
        .insert(locations)
        .values(input)
        .onConflictDoUpdate({
          target: locations.id,
          set: {
            ...input,
            created_by_email: user?.email,
            created_by_name: user?.name,
          },
        })
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
