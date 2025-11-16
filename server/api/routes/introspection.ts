import { defineEndpoint } from '../util.ts';
import { env } from '../env.ts';

export const introspectionEndpoint = defineEndpoint({
  inputSchema: null,
  handler: () => {
    return Promise.resolve({
      DENO_DEPLOY_BUILD_ID: env.DENO_DEPLOY_BUILD_ID || null,
      DENO_DEPLOYMENT_ID: env.DENO_DEPLOYMENT_ID || null,
    });
  },
});
