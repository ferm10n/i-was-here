import { defineEndpoint } from '../util.ts';
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client();
export const googleAuthCallbackEndpoint = defineEndpoint({
  inputSchema: null,
  handler: async (input, req) => {
    console.log('Handling Google OAuth callback');
    const code = new URL(req.url).searchParams.get('code');
    if (!code) {
      throw new Response('Missing code parameter', {
        status: 400,
        headers: { 'content-type': 'text/plain' },
      });
    }
    console.log('Received authorization code:', code);

    const response = await fetch(Deno.env.get('GOOGLE_OAUTH_ACCESS_TOKEN_URL')!, {
      method: "POST",
      body: JSON.stringify({
        code,
        client_id: Deno.env.get('VITE_GOOGLE_OAUTH_CLIENT_ID'),
        client_secret: Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET'),
        redirect_uri: Deno.env.get('VITE_GOOGLE_OAUTH_REDIRECT_URI'),
        grant_type: 'authorization_code',
      }),
    });
    const accessTokenData = await response.json();
    const {
      id_token,
    } = accessTokenData;

    const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: Deno.env.get('VITE_GOOGLE_OAUTH_CLIENT_ID'),  // Specify the WEB_CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
    });
    const payload = ticket.getPayload() as {
      email: string;
      name: string;
    };

    // TODO assign a cookie or something

    return { code, accessTokenData, payload };
  },
});
