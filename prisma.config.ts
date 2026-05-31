import 'dotenv/config';

import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
  // CLI (migrate, db push) uses direct Neon URL — not the pooler.
  datasource: {
    url: env('DIRECT_URL'),
  },
});
