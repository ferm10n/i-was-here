import * as z from 'zod/v4';
import { defineEndpoint, locations$ } from '../util.ts';

const textEncoder = new TextEncoder();

export const watchLocationsEndpoint = defineEndpoint({
  inputSchema: null,
  protected: true,
  handler: (_reqBody, _req, _user) => {
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

    return Promise.resolve(new Response(body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    }));
  },
});