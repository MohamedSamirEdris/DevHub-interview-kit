import bcrypt from 'bcryptjs';
import { getPool, closePool, query } from '../db/postgres';
import { connectMongo, closeMongo, getMongoDb } from '../db/mongo';

const DEMO_PASSWORD = 'devhub123';

async function seedPostgres() {
  console.log('Seeding PostgreSQL...');

  await query('TRUNCATE team_members, services, users, teams RESTART IDENTITY CASCADE');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const teams = [
    { name: 'Platform Engineering', slug: 'platform', description: 'Core infrastructure and developer experience' },
    { name: 'Payments', slug: 'payments', description: 'Payment processing and billing' },
    { name: 'Identity', slug: 'identity', description: 'AuthN/AuthZ and user management' },
    { name: 'Data Platform', slug: 'data', description: 'Analytics pipelines and warehousing' },
    { name: 'Mobile', slug: 'mobile', description: 'iOS and Android client apps' },
  ];

  const teamIds: string[] = [];
  for (const t of teams) {
    const res = await query<{ id: string }>(
      `INSERT INTO teams (name, slug, description, member_count, team_name_dup)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [t.name, t.slug, t.description, Math.floor(Math.random() * 12) + 3, t.name],
    );
    teamIds.push(res.rows[0].id);
  }

  const users = [
    { email: 'admin@devhub.local', name: 'Alex Admin', role: 'admin', teamIdx: 0 },
    { email: 'engineer@devhub.local', name: 'Sam Engineer', role: 'engineer', teamIdx: 0 },
    { email: 'viewer@devhub.local', name: 'Vera Viewer', role: 'viewer', teamIdx: 1 },
    { email: 'lead@devhub.local', name: 'Jordan Lead', role: 'engineer', teamIdx: 2 },
  ];

  const userIds: string[] = [];
  for (const u of users) {
    const res = await query<{ id: string }>(
      `INSERT INTO users (email, name, role, team_id, password_hash)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [u.email, u.name, u.role, teamIds[u.teamIdx], passwordHash],
    );
    userIds.push(res.rows[0].id);
  }

  await query('UPDATE teams SET lead_id = $1 WHERE id = $2', [userIds[3], teamIds[2]]);

  for (let i = 0; i < userIds.length; i++) {
    await query(
      'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [teamIds[i % teamIds.length], userIds[i]],
    );
  }

  const services = [
    { name: 'DevHub API', slug: 'devhub-api', teamIdx: 0, tier: 'tier-1', status: 'healthy', tags: ['nodejs', 'api'] },
    { name: 'DevHub Web', slug: 'devhub-web', teamIdx: 0, tier: 'tier-1', status: 'healthy', tags: ['react', 'spa'] },
    { name: 'Auth Gateway', slug: 'auth-gateway', teamIdx: 2, tier: 'tier-1', status: 'healthy', tags: ['security'] },
    { name: 'Payment Processor', slug: 'payment-processor', teamIdx: 1, tier: 'tier-1', status: 'degraded', tags: ['payments'] },
    { name: 'Ledger Service', slug: 'ledger', teamIdx: 1, tier: 'tier-2', status: 'healthy', tags: ['finance'] },
    { name: 'User Directory', slug: 'user-directory', teamIdx: 2, tier: 'tier-2', status: 'healthy', tags: ['identity'] },
    { name: 'Event Bus', slug: 'event-bus', teamIdx: 0, tier: 'tier-1', status: 'healthy', tags: ['kafka', 'messaging'] },
    { name: 'Metrics Collector', slug: 'metrics-collector', teamIdx: 3, tier: 'tier-2', status: 'healthy', tags: ['observability'] },
    { name: 'ETL Pipeline', slug: 'etl-pipeline', teamIdx: 3, tier: 'tier-2', status: 'degraded', tags: ['data'] },
    { name: 'Mobile BFF', slug: 'mobile-bff', teamIdx: 4, tier: 'tier-2', status: 'healthy', tags: ['mobile', 'bff'] },
    { name: 'Push Notifications', slug: 'push-notifications', teamIdx: 4, tier: 'tier-3', status: 'unknown', tags: ['mobile'] },
    { name: 'Feature Flags', slug: 'feature-flags', teamIdx: 0, tier: 'tier-2', status: 'healthy', tags: ['platform'] },
    { name: 'Search Indexer', slug: 'search-indexer', teamIdx: 3, tier: 'tier-3', status: 'down', tags: ['search'] },
    { name: 'CDN Edge', slug: 'cdn-edge', teamIdx: 0, tier: 'tier-1', status: 'healthy', tags: ['infra'] },
    { name: 'Audit Logger', slug: 'audit-logger', teamIdx: 2, tier: 'tier-2', status: 'healthy', tags: ['compliance'] },
  ];

  for (const s of services) {
    const teamId = teamIds[s.teamIdx];
    const teamName = teams[s.teamIdx].name;
    await query(
      `INSERT INTO services (name, slug, description, team_id, team_name, tier, status, repository_url, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        s.name,
        s.slug,
        `${s.name} microservice`,
        teamId,
        teamName,
        s.tier,
        s.status,
        `https://github.com/devhub-org/${s.slug}`,
        s.tags,
      ],
    );
  }

  console.log('PostgreSQL seed complete.');
  console.log('Demo users (password: devhub123):');
  users.forEach((u) => console.log(`  - ${u.email} (${u.role})`));
}

async function seedMongo() {
  console.log('Seeding MongoDB...');
  const db = await getMongoDb();

  await db.collection('metrics').deleteMany({});
  await db.collection('logs').deleteMany({});
  await db.collection('analytics').deleteMany({});

  const serviceIds = ['devhub-api', 'auth-gateway', 'payment-processor', 'event-bus', 'metrics-collector'];
  const now = Date.now();

  for (const serviceId of serviceIds) {
    const points = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(now - (23 - i) * 3600000).toISOString(),
      value: Math.floor(Math.random() * 5000) + 1000,
    }));

    await db.collection('metrics').insertOne({
      serviceId,
      serviceName: serviceId.replace(/-/g, ' '),
      metric: 'requests_per_hour',
      unit: 'count',
      points,
    });
  }

  const logLevels = ['info', 'info', 'warn', 'error', 'debug'] as const;
  const logMessages = [
    'Request completed successfully',
    'Cache miss for key user:session',
    'Retry attempt 2/3 for upstream dependency',
    'Connection timeout to payment-processor',
    'Debug trace enabled for requestId',
    'Rate limit threshold approaching',
    'Deployed version v2.4.1',
  ];

  for (let i = 0; i < 200; i++) {
    await db.collection('logs').insertOne({
      serviceId: serviceIds[i % serviceIds.length],
      level: logLevels[i % logLevels.length],
      message: logMessages[i % logMessages.length] + ` #${i}`,
      timestamp: new Date(now - i * 60000).toISOString(),
      metadata: { requestId: `req-${i}`, region: i % 2 === 0 ? 'us-east-1' : 'eu-west-1' },
    });
  }

  const events = ['page_view', 'service_click', 'search', 'login', 'export_metrics'];
  for (let i = 0; i < 100; i++) {
    await db.collection('analytics').insertOne({
      event: events[i % events.length],
      userId: i % 3 === 0 ? `user-${i % 4}` : undefined,
      properties: { path: '/services', durationMs: Math.random() * 2000 },
      timestamp: new Date(now - i * 120000).toISOString(),
    });
  }

  console.log('MongoDB seed complete.');
}

async function main() {
  getPool();
  await connectMongo();
  await seedPostgres();
  await seedMongo();
  await closePool();
  await closeMongo();
  console.log('All seeds finished.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
