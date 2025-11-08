import { WideApiEndpointDef } from './util.ts';
import { helloEndpoint } from './routes/hello.ts';
import { introspectionEndpoint } from './routes/introspection.ts';

export const router = {
  '/api/hello': helloEndpoint,
  '/api/introspection': introspectionEndpoint,
} satisfies {
  [path: string]: WideApiEndpointDef;
};
