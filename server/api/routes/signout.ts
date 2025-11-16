import { defineEndpoint } from '../util.ts';
import * as cookie from '@std/http/cookie';
import { COOKIE } from '../auth.ts';

export const signoutEndpoint = defineEndpoint({
  inputSchema: null,
  handler: (_input, _req, _user) => {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    cookie.deleteCookie(headers, COOKIE, {
      path: '/',
    });

    return Promise.resolve(new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers,
    }));
  },
});
