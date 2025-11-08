import { defineEndpoint } from '../util.ts';

export const introspectionEndpoint = defineEndpoint({
  inputSchema: null,
  handler: () => {
    return Promise.resolve({
      DENO_DEPLOY_BUILD_ID: Deno.env.get('DENO_DEPLOY_BUILD_ID') || null,
      DENO_DEPLOYMENT_ID: Deno.env.get('DENO_DEPLOYMENT_ID') || null,
    });
  },
});
