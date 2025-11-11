import { ApiEndpointDef } from './util.ts';
import { helloEndpoint } from './routes/hello.ts';
import { introspectionEndpoint } from './routes/introspection.ts';
import { saveLocationEndpoint } from './routes/save-location.ts';
import { z } from '@zod/zod/v4';

export const router = {
  '/api/hello': helloEndpoint,
  '/api/introspection': introspectionEndpoint,
  '/api/save-location': saveLocationEndpoint,
} satisfies {
  [path: string]: ApiEndpointDef<any, any>;
};


export type ApiRouter = {
  [endpoint in keyof typeof router]: typeof router[endpoint] extends
  ApiEndpointDef<infer I, infer O> ? {
    input: z.infer<I>;
    output: O;
  }
  : never;
};