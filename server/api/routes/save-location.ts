import * as z from "@zod/zod/v4";
import { defineEndpoint } from '../util.ts';

const saveLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  note: z.string().optional(),
  revisit: z.boolean().optional(),
});

export const saveLocationEndpoint = defineEndpoint({
  inputSchema: saveLocationSchema,
  handler: (input) => {
    const data = input;
    // TODO: Implement actual database storage
    console.log('Saving location:', data);

    return Promise.resolve({
      success: true,
      location: data,
      savedAt: new Date().toISOString(),
    });
  },
});
