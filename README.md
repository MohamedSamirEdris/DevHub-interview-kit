# DevHub Interview Kit

A realistic internal developer portal simulation inspired by [Backstage](https://backstage.io). DevHub helps engineers discover teams, browse the services catalog, search the estate, and review operational metrics.

This repository is designed for technical interviews (60–90 minutes, live pairing, or take-home) across frontend, backend, full-stack, debugging, and architecture skills.

## Interview quick start (candidates)

**No local install required.** Open a Codespace on this branch (`interview`):

| Approach              | You need              | Link                                                                                                                          |
| --------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **GitHub Codespaces** | Browser + repo access | **[Open Codespace](https://codespaces.new/MohamedSamirEdris/DevHub-interview-kit/tree/interview?quickstart=1)** |

```bash
# After the Codespace opens (if the app is not already running):
npm run dev
```

Then open port **5173** in the **Ports** tab (not `localhost` on your laptop).

Login: `engineer@devhub.local` / `devhub123`

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/MohamedSamirEdris/DevHub-interview-kit/tree/interview?quickstart=1)

Work from **`TASKS.md`**. Setup includes Node.js, PostgreSQL, MongoDB, dependencies, migrations, and seed data.

| Guide                     |                                                        |
| ------------------------- | ------------------------------------------------------ |
| Codespaces (step-by-step) | **[docs/CODESPACES.md](docs/CODESPACES.md)**           |
| All interview options     | **[docs/INTERVIEW_SETUP.md](docs/INTERVIEW_SETUP.md)** |

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
├── TASKS.md               # Interview tasks
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

1. Read `TASKS.md` for your assigned tasks.
2. Reproduce each issue in the app (browser console, network tab, logs).
3. Fix with minimal, targeted changes and explain your approach.
4. See `docs/ONBOARDING.md` for portal context.

Suggested time boxes:

- **60 min:** Easy + 1–2 Medium tasks
- **90 min:** Medium focus + 1 Hard task
- **Take-home:** Full TASKS.md over 4–8 hours

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
