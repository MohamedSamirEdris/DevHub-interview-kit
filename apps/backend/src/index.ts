import { createApp } from './app';
import { env } from './config/env';
import { connectMongo } from './db/mongo';
import { getPool } from './db/postgres';

async function main() {
  try {
    getPool();
    await connectMongo();
  } catch (err) {
    console.error('Database connection failed:', err);
    console.error('Ensure PostgreSQL and MongoDB are running. See README.md');
    process.exit(1);
  }

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`DevHub API listening on http://localhost:${env.port}`);
    console.log(`Health check: http://localhost:${env.port}/api/health`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
