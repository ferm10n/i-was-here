import { defineEndpoint, locations$ } from '../util.ts';

const textEncoder = new TextEncoder();

export const watchLocationsEndpoint = defineEndpoint({
  inputSchema: null,
  protected: true,
  handler: (_reqBody, _req, _user) => {
    let unsubscribe: (() => void) | null = null;

    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(textEncoder.encode(`event: started\n\n`))
        const subscriber = locations$.subscribe(newLocation => {
          try {
            const msg = textEncoder.encode(`data: ${JSON.stringify({ id: newLocation.id, lat: newLocation.lat, lng: newLocation.lng })}\n\n`);
            controller.enqueue(msg);
          } catch (error) {
            // Stream is closed, client disconnected
            console.log('Client may have disconnected from location stream', error);
            if (unsubscribe) unsubscribe();
          }
        });
        unsubscribe = () => {
          subscriber.unsubscribe();
        }
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