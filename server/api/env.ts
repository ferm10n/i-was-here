// .env will be auto loaded with the `--env` option

const requiredEnv = {
  VITE_GOOGLE_OAUTH_CLIENT_ID: true,
  GOOGLE_OAUTH_CLIENT_SECRET: true,
  GOOGLE_OAUTH_ACCESS_TOKEN_URL: true,
  GOOGLE_OAUTH_REDIRECT_ORIGIN: false,
  DATABASE_URL: true,
  PORT: false,
  DENO_DEPLOY_BUILD_ID: false,
  DENO_DEPLOY_APP_SLUG: false,
  DENO_DEPLOY_ORG_SLUG: false,
};
export const env = {} as Record<keyof typeof requiredEnv, string>;

for (const envVar of Object.keys(requiredEnv)) {
  const envVal = Deno.env.get(envVar);
  if (!envVal && (requiredEnv as Record<string, boolean>)[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    Deno.exit(1);
  }
  if (envVal) {
    (env as Record<string, string>)[envVar] = envVal;
  }
}