import * as z from "@zod/zod/v4";
import { defineEndpoint, locations$ } from '../util.ts';
import { locationInsertSchema, locations } from '../../db/schema.ts';
import { db } from '../../db/index.ts';

const textEncoder = new TextEncoder();

export const watchLocationsEndpoint = defineEndpoint({
  inputSchema: null,
  handler: (reqBody, req) => {
    let unsubscribe: (() => void) | null;

    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(textEncoder.encode(`event: started\n\n`))
        unsubscribe = locations$.subscribe(newLocation => {
          const msg = textEncoder.encode(`data: ${JSON.stringify({ lat: newLocation.lat, lng: newLocation.lng })}\n\n`);
          controller.enqueue(msg);
        }).unsubscribe;
      },
      cancel() {
        if (unsubscribe) unsubscribe();
      }
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  },
});