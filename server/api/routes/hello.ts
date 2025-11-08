import { defineEndpoint } from '../util.ts';

export const helloEndpoint = defineEndpoint({
  inputSchema: null,
  handler: () => {
    return Promise.resolve('Hello world!');
  },
});
