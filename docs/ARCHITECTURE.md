# DevHub Architecture

## System context

DevHub is a simplified internal developer portal. Teams own services; operators review metrics and logs stored separately from core entity data.

## Data stores

| Store | Contents | Access layer |
|-------|----------|--------------|
| PostgreSQL | users, teams, team_members, services | `db/postgres.ts`, services in `src/services/*` |
| MongoDB | metrics time-series, logs, analytics events | `db/mongo.ts`, `metricsService.ts` |

## API surface

| Prefix | Auth | Description |
|--------|------|-------------|
| `/api/auth` | Public login | JWT issuance |
| `/api/teams` | Bearer | Team directory |
| `/api/services` | Bearer | Service catalog |
| `/api/metrics` | Bearer | Observability data |
| `/api/health` | Public | Dependency health |

## Frontend routes

| Path | Page |
|------|------|
| `/login` | Authentication |
| `/teams` | Teams dashboard |
| `/services` | Services catalog |
| `/search` | Global search |
| `/metrics` | Metrics & logs |
| `/settings` | User preferences |

## Shared contracts

`@devhub/shared-types` is the canonical TypeScript contract between frontend and backend. Runtime validation is minimal today (Zod on login only).

## Extension points

`plugins/registry.ts` provides a Backstage-inspired plugin hook. Registration lifecycle is not fully wired — see Senior task S1.

## Known technical debt

See `TASKS.md` for interview-sized improvements. Intentional issues exist for evaluation.
