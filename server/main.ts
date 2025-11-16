/// <reference lib="deno.ns" />
import { serveDir } from '@std/http/file-server';
import { parseOrDie, WideApiEndpointDef } from './api/util.ts';
import { router } from './api/router.ts';
import { decodeJwt } from './api/auth.ts';
import { env } from './api/env.ts';

const wideRouter = router as Record<string, WideApiEndpointDef>;

Deno.serve({
  port: parseInt(env.PORT || '6969', 10),
}, async (req) => {
  try {
    const pathname = new URL(req.url).pathname;

    const apiEndpoint: WideApiEndpointDef = wideRouter[pathname];

    // is this an API request?
    if (apiEndpoint) {
      let body: unknown = null;

      const user = decodeJwt(req);

      if (apiEndpoint.protected) {
        if (!user) {
          return new Response('Unauthorized', { status: 401 });
        }
      }

      // validate input if needed
      if (apiEndpoint.inputSchema) {
        // validate there is a payload to parse
        const contentType = req.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Response('Content-Type must be application/json', { status: 400 });
        }

        body = parseOrDie(apiEndpoint.inputSchema, await req.json());
      }

      // get a response
      const handlerResult = await apiEndpoint.handler(body, req, user);

      // return the response depending on the result type
      if (handlerResult instanceof Response) {
        return handlerResult;
      }
      if (typeof handlerResult === 'string') {
        return new Response(handlerResult, {
          headers: { 'Content-Type': 'text/plain' },
        });
      } else {
        return new Response(JSON.stringify(handlerResult), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
        });
      }
    }

    // Serve static assets from dist directory
    // First try to serve the exact path for static assets
    const fsRoot = 'dist';
    try {
      // Check if the path is a file in our dist directory
      const normalized = pathname === '/' ? '/index.html' : pathname;
      const pathStat = await Deno.stat(`${fsRoot}${normalized}`);

      // If it's a file, serve it directly
      if (pathStat.isFile) {
        return serveDir(req, {
          fsRoot,
          headers: ['Cache-Control: public, max-age=86400'],
        });
      }
    } catch {
      // File doesn't exist, continue to serve index.html
    }

    // For all other routes, serve index.html to support SPA client-side routing
    return new Response(await Deno.readFile(`${fsRoot}/index.html`), {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error('Error handling request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});
