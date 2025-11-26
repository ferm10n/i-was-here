import * as z from 'zod/v4';
import { ApiEndpointDef } from './util.ts';
import { helloEndpoint } from './routes/hello.ts';
import { introspectionEndpoint } from './routes/introspection.ts';
import { saveLocationEndpoint } from './routes/save-location.ts';
import { watchLocationsEndpoint } from './routes/watch-locations.ts';
import { getLocationsEndpoint } from './routes/get-locations.ts';
import { googleAuthCallbackEndpoint } from './routes/google-auth-cb.ts';
import { signoutEndpoint } from './routes/signout.ts';
import { GOOGLE_OAUTH_REDIRECT_PATH } from '../../src/consts.ts';

export const router = {
  '/api/hello': helloEndpoint,
  '/api/introspection': introspectionEndpoint,
  '/api/save-location': saveLocationEndpoint,
  '/api/watch-locations': watchLocationsEndpoint,
  '/api/get-locations': getLocationsEndpoint,
  [ GOOGLE_OAUTH_REDIRECT_PATH ]: googleAuthCallbackEndpoint,
  '/api/signout': signoutEndpoint,
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