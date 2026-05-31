/**
 * Quick Neon + Prisma connectivity check.
 * Run: npx tsx scripts/verify-db.ts
 */
/* eslint-disable no-console -- CLI verification script */
import 'dotenv/config';

import { db } from '../lib/prisma';

async function main() {
  const hasPooledUrl = Boolean(process.env.DATABASE_URL?.includes('-pooler'));
  const hasDirectUrl = Boolean(process.env.DIRECT_URL);
  const hasTimeouts = /connect_timeout=|pool_timeout=/.test(
    process.env.DATABASE_URL ?? '',
  );

  console.log('Config:');
  console.log(
    `  DATABASE_URL (pooled): ${hasPooledUrl ? 'yes' : 'missing -pooler host'}`,
  );
  console.log(`  DIRECT_URL set:        ${hasDirectUrl ? 'yes' : 'no'}`);
  console.log(`  Timeout params:      ${hasTimeouts ? 'yes' : 'no'}`);

  const [{ ok }] = await db.$queryRaw<Array<{ ok: number }>>`SELECT 1 as ok`;
  console.log(`\nPooled query (SELECT 1): ok=${ok}`);

  const userCount = await db.user.count();
  console.log(`User table reachable: count=${userCount}`);

  await db.$transaction(
    async (tx) => {
      const [{ txOk }] = await tx.$queryRaw<
        Array<{ txOk: number }>
      >`SELECT 1 as "txOk"`;
      console.log(`Interactive transaction: ok=${txOk}`);
    },
    { maxWait: 10_000, timeout: 30_000 },
  );

  console.log('\nNeon + Prisma configuration looks healthy.');
}

main()
  .catch((error) => {
    console.error('\nVerification failed:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
