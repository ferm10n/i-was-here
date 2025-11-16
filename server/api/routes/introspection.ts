import { defineEndpoint } from '../util.ts';

export const introspectionEndpoint = defineEndpoint({
  inputSchema: null,
  handler: (_input, _req, user) => {
    return Promise.resolve(user || {});
  },
});
