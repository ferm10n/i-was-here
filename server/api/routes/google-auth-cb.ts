import { env } from '../env.ts';
import { defineEndpoint } from '../util.ts';
import { OAuth2Client } from 'google-auth-library';
import * as cookie from "@std/http/cookie";
import { COOKIE, signJwt } from '../auth.ts';

const client = new OAuth2Client();
export const googleAuthCallbackEndpoint = defineEndpoint({
  inputSchema: null,
  handler: async (_input, req) => {
    console.log('Handling Google OAuth callback');
    const code = new URL(req.url).searchParams.get('code');
    if (!code) {
      throw new Response('Missing code parameter', {
        status: 400,
        headers: { 'content-type': 'text/plain' },
      });
    }
    console.log('Received authorization code:', code);

    const response = await fetch(env.GOOGLE_OAUTH_ACCESS_TOKEN_URL, {
      method: "POST",
      body: JSON.stringify({
        code,
        client_id: env.VITE_GOOGLE_OAUTH_CLIENT_ID,
        client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri: env.VITE_GOOGLE_OAUTH_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const accessTokenData = await response.json();
    const {
      id_token,
    } = accessTokenData;

    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: env.VITE_GOOGLE_OAUTH_CLIENT_ID,
    });
    const payload = ticket.getPayload() as {
      email: string;
      name: string;
    };

    // Create JWT token with user payload
    const jwt = signJwt({ email: payload.email, name: payload.name });

    // Create response with cookie
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Location': '/', // Redirect to home page after successful auth
    });

    cookie.setCookie(headers, {
      name: COOKIE,
      value: jwt,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/',
    });

    return new Response(JSON.stringify({ success: true, user: { email: payload.email, name: payload.name } }), {
      status: 302,
      headers,
    });
  },
});
