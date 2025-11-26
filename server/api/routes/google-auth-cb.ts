import { env } from '../env.ts';
import { defineEndpoint } from '../util.ts';
import { OAuth2Client } from 'google-auth-library';
import * as cookie from "@std/http/cookie";
import { COOKIE, signJwt } from '../auth.ts';
import { GOOGLE_OAUTH_REDIRECT_PATH } from '../../../src/consts.ts';

const client = new OAuth2Client();
export const googleAuthCallbackEndpoint = defineEndpoint({
  inputSchema: null,
  handler: async (_input, req) => {
    console.log('Handling Google OAuth callback');
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    if (!code) {
      throw new Response('Missing code parameter', {
        status: 400,
        headers: { 'content-type': 'text/plain' },
      });
    }

    const ourTrueRedirectUri = (env.DENO_DEPLOY_APP_SLUG && env.DENO_DEPLOY_BUILD_ID && env.DENO_DEPLOY_ORG_SLUG)
      ? `https://${env.DENO_DEPLOY_APP_SLUG}-${env.DENO_DEPLOY_BUILD_ID}.${env.DENO_DEPLOY_ORG_SLUG}.deno.net${GOOGLE_OAUTH_REDIRECT_PATH}`
      : `${env.VITE_GOOGLE_OAUTH_REDIRECT_ORIGIN}${GOOGLE_OAUTH_REDIRECT_PATH}`

    const oauthState = url.searchParams.get('state');
    if (oauthState) {
      try {
        const parsedOauthState = JSON.parse(oauthState);
        if (typeof parsedOauthState !== 'object' || parsedOauthState === null || !parsedOauthState.trueRedirectUri) {
          throw new Error('Unable to parse oauth state: ' + oauthState)
        }

        const trueRedirectUri = parsedOauthState.trueRedirectUri;
        if (typeof trueRedirectUri !== 'string' || !trueRedirectUri.endsWith(`${env.DENO_DEPLOY_ORG_SLUG}.deno.net${GOOGLE_OAUTH_REDIRECT_PATH}`)) {
          throw new Error('invalid trueRedirectUri: ' + JSON.stringify(trueRedirectUri));
        }
        
        // Create redirect response
        console.log('redirecting auth cb to ' + trueRedirectUri);
        return new Response(null, {
          status: 302,
          headers: {
            'Location': trueRedirectUri + '?code=' + encodeURIComponent(code),
          },
        });
      } catch (err) {
        console.warn(err);
      }
    }

    const response = await fetch(env.GOOGLE_OAUTH_ACCESS_TOKEN_URL, {
      method: "POST",
      body: JSON.stringify({
        code,
        client_id: env.VITE_GOOGLE_OAUTH_CLIENT_ID,
        client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri: `${env.VITE_GOOGLE_OAUTH_REDIRECT_ORIGIN}${GOOGLE_OAUTH_REDIRECT_PATH}`,
        grant_type: 'authorization_code',
        state: {
          trueRedirectUri: ourTrueRedirectUri,
        }
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
      picture?: string;
    };

    // Create JWT token with user payload
    const jwt = signJwt({
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    });

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
