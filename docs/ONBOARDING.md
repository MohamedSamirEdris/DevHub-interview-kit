# DevHub Onboarding

Welcome to the Platform Engineering team. DevHub is our internal developer portal for discovering teams, services, and operational metrics.

## Day 1 checklist

1. Clone the repository and run `./scripts/setup.sh`
2. Configure environment variables (see root README)
3. Run migrations and seed data
4. Start the API and web app with `npm run dev`
5. Log in with demo credentials from the README
6. Read `TASKS.md` if you are in an interview session

## Architecture overview

```
┌─────────────┐     REST      ┌─────────────┐
│   React     │ ────────────► │   Express   │
│   (Vite)    │               │   API       │
└─────────────┘               └──────┬──────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
              PostgreSQL          MongoDB      @devhub/shared-types
           users, teams,        metrics, logs
            services           analytics
```

## Key directories

| Path | Purpose |
|------|---------|
| `apps/frontend` | React SPA |
| `apps/backend` | Express API |
| `packages/shared-types` | Shared TypeScript contracts |
| `docs/` | Internal documentation |

## Conventions

- API routes live under `/api/*`
- Authenticated routes expect `Authorization: Bearer <token>`
- Shared types should be updated in `packages/shared-types` when contracts change

## Getting help

- API health: `GET /api/health`
- Demo users are seeded — see README
- Known gaps are tracked as TODO comments in the codebase
