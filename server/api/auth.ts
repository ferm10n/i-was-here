import jsonwebtoken from 'jsonwebtoken';
import * as cookie from "@std/http/cookie";
import { env } from './env.ts';

export const COOKIE = 'jwt';

export type JwtPayload = {
  email: string;
  name: string;
  picture?: string;
};

export function signJwt(payload: JwtPayload): string {
  return jsonwebtoken.sign(
    payload,
    env.GOOGLE_OAUTH_CLIENT_SECRET
  );
}

export function decodeJwt(req: Request): JwtPayload | null {
  const reqCookies = cookie.getCookies(req.headers);
  const jwt = reqCookies[COOKIE];

  if (!jwt) {
    return null;
  }

  try {
    const decoded = jsonwebtoken.verify(jwt, env.GOOGLE_OAUTH_CLIENT_SECRET);
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}
