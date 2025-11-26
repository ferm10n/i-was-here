import { env } from '../env.ts';
import { defineEndpoint } from '../util.ts';

export const introspectionEndpoint = defineEndpoint({
  inputSchema: null,
  handler: (_input, _req, user) => {
    return Promise.resolve({
      user: user || {},
      DENO_DEPLOY_BUILD_ID: env.DENO_DEPLOY_BUILD_ID,
      DENO_DEPLOY_APP_SLUG: env.DENO_DEPLOY_APP_SLUG,
      DENO_DEPLOY_ORG_SLUG: env.DENO_DEPLOY_ORG_SLUG,
    });
  },
});
