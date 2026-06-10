# DevHub Interview Kit

A realistic internal developer portal simulation inspired by [Backstage](https://backstage.io). DevHub helps engineers discover teams, browse the services catalog, search the estate, and review operational metrics.

This repository is designed for **technical lead** interviews (90–120 minutes live, or take-home).

## Quick start (tech lead candidate)

**No local install required.** Open a Codespace on this branch (`interview-lead`):

| Approach              | Link                                                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **GitHub Codespaces** | **[Open Codespace](https://github.com/codespaces/new?hide_repo_select=true&ref=interview-lead&repo=MohamedSamirEdris/DevHub-interview-kit)** |

```bash
# After the Codespace opens (if the app is not already running):
npm run dev
```

Then open port **5173** in the **Ports** tab.

Login: `engineer@devhub.local` / `devhub123`

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=interview-lead&repo=MohamedSamirEdris/DevHub-interview-kit)

**Your assignment:** read **`TASKS_LEAD.md`** — practical coding, **deployment** tasks (Docker/CI/runbook), and architecture discussion.

| Guide                |                                                  |
| -------------------- | ------------------------------------------------ |
| Codespaces           | **[docs/CODESPACES.md](docs/CODESPACES.md)**     |
| Architecture context | **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** |

## Stack

| Layer     | Technologies                                                            |
| --------- | ----------------------------------------------------------------------- |
| Frontend  | React, TypeScript, Vite, React Query, React Router                      |
| Backend   | Node.js, Express, TypeScript                                            |
| Databases | PostgreSQL (users, teams, services), MongoDB (metrics, logs, analytics) |
| Tooling   | ESLint, Prettier, npm workspaces, shared types package                  |

**Recommended for interviews:** Docker Desktop + `npm run interview` (app + databases in one command).

**Optional:** native PostgreSQL + MongoDB for local development without Docker (see below).

## Prerequisites

### Interview / take-home (recommended)

- **Docker Desktop** only

### Local development without Docker

- **Node.js** 18+
- **npm** 9+
- **PostgreSQL** 14+ (local install)
- **MongoDB** 6+ (local install)

### macOS (Homebrew)

```bash
brew install postgresql@16 mongodb-community
brew services start postgresql@16
brew services start mongodb-community
createdb devhub
```

### Linux

Use your distribution packages for `postgresql` and `mongodb`, then create database `devhub`.

## Quick start

### One command (Docker — recommended)

```bash
git clone <repo-url> devhub-interview-kit
cd devhub-interview-kit
npm run interview
```

### Manual setup (no Docker)

```bash
git clone <repo-url> devhub-interview-kit
cd devhub-interview-kit
chmod +x scripts/setup.sh
./scripts/setup.sh

# Configure env (created automatically on first setup)
# Edit apps/backend/.env if your DB credentials differ

npm run db:migrate
npm run seed
npm run dev
```

| Service      | URL                              |
| ------------ | -------------------------------- |
| Frontend     | http://localhost:5173            |
| Backend API  | http://localhost:4000/api        |
| Health check | http://localhost:4000/api/health |

## Demo accounts

Password for all users: `devhub123`

| Email                 | Role     |
| --------------------- | -------- |
| admin@devhub.local    | admin    |
| engineer@devhub.local | engineer |
| viewer@devhub.local   | viewer   |
| lead@devhub.local     | engineer |

## Project structure

```
devhub-interview-kit/
├── apps/
│   ├── frontend/          # React SPA
│   └── backend/           # Express API
├── packages/
│   └── shared-types/      # Shared TypeScript contracts
├── docs/                  # Onboarding & architecture notes
├── scripts/setup.sh
├── TASKS.md               # IC interview tasks (reference)
├── TASKS_LEAD.md          # Technical lead interview (this session)
└── package.json           # npm workspaces root
```

## Environment variables

### Backend (`apps/backend/.env`)

Copy from `apps/backend/.env.example`:

| Variable       | Description                                       |
| -------------- | ------------------------------------------------- |
| `PORT`         | API port (default `4000`)                         |
| `DATABASE_URL` | PostgreSQL connection string                      |
| `MONGODB_URI`  | MongoDB connection string                         |
| `JWT_SECRET`   | Token signing secret                              |
| `CORS_ORIGIN`  | Frontend origin (default `http://localhost:5173`) |

### Frontend (`apps/frontend/.env`)

| Variable       | Description                                      |
| -------------- | ------------------------------------------------ |
| `VITE_API_URL` | API base path (default `/api` — proxied by Vite) |

## Scripts

| Command                  | Description                                                |
| ------------------------ | ---------------------------------------------------------- |
| `npm run interview`      | Start app + databases via Docker (recommended)             |
| `npm run interview:down` | Stop Docker stack                                          |
| `npm run dev`            | Start frontend + backend concurrently (requires local DBs) |
| `npm run dev:frontend`   | Frontend only                                              |
| `npm run dev:backend`    | Backend only                                               |
| `npm run build`          | Build all workspaces                                       |
| `npm run db:migrate`     | Run PostgreSQL migrations                                  |
| `npm run seed`           | Seed PostgreSQL + MongoDB                                  |
| `npm run lint`           | Lint all workspaces                                        |
| `npm run format`         | Format with Prettier                                       |

## Interview usage

1. Work from **`TASKS_LEAD.md`** (assigned sections from your interviewer).
2. Reproduce issues before fixing; explain trade-offs and production impact.
3. Deployment tasks use `docker/`, `docker-compose.yml`, and optional `docs/` deliverables.
4. IC-level tasks in `TASKS.md` are optional reference — not required for this session.

Suggested time boxes:

- **90 min:** 2× Part A coding + 2× Part B deployment + 2× Part C discussion
- **Take-home:** 3× Part A + 3× Part B (include CI + runbook) + written Part C

## Troubleshooting

### Database connection failed

- Confirm PostgreSQL and MongoDB are running.
- Verify `DATABASE_URL` and `MONGODB_URI` in `apps/backend/.env`.
- Create the database: `createdb devhub` (PostgreSQL).

### `relation does not exist`

Run migrations before seeding:

```bash
npm run db:migrate
npm run seed
```

### Frontend cannot reach API

- Ensure backend is on port 4000.
- Vite proxies `/api` to the backend — use `VITE_API_URL=/api` (default).
- Check `CORS_ORIGIN` matches the frontend URL.

### Shared types not found

Build the types package:

```bash
npm run build -w @devhub/shared-types
```

### Login does not redirect

This may be intentional interview behavior — see `TASKS.md`.

## Docker commands

```bash
npm run interview          # Foreground: build + start everything
npm run interview:detached # Background (e.g. Codespaces postCreate)
npm run interview:down     # Stop containers
npm run interview:logs     # Follow logs
```

## License

Internal interview use only.
