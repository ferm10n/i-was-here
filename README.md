# Setup

- install deno ^2.7.13
- populate .env from .env.template
- ensure DB has `postgis` extension enabled -
  `create extension if not exists postgis;`
- initialize DB schema - `deno task db:migrate`
- deploy to https://deno.com/deploy, assigning the correct env and app
  configuration
