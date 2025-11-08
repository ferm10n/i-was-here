import { WideApiEndpointDef } from './util.ts';
import { helloEndpoint } from './routes/hello.ts';

export const router = {
  '/api/hello': helloEndpoint,
} satisfies {
  [path: string]: WideApiEndpointDef;
};
