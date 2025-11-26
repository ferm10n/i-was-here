import { defineEndpoint } from '../util.ts';

export const introspectionEndpoint = defineEndpoint({
  inputSchema: null,
  handler: (_input, _req, user) => {
    return Promise.resolve({
      user: user || {},

      // just exposing these for now for testing
      DENO_DEPLOY_BUILD_ID: Deno.env.get('DENO_DEPLOY_BUILD_ID'),
      DENO_DEPLOY_APP_SLUG: Deno.env.get('DENO_DEPLOY_APP_SLUG'),
      DENO_DEPLOY_APP_ID: Deno.env.get('DENO_DEPLOY_APP_ID'),
      DENO_DEPLOY_ORG_SLUG: Deno.env.get('DENO_DEPLOY_ORG_SLUG'),
    });
  },
});
