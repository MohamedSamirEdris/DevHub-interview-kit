# DevHub Technical Lead Interview

**Audience:** Technical lead / staff engineer candidates.  
**Duration:** 90–120 minutes live, or 4–6 hours take-home.

This pack focuses on **judgment, architecture, security, and deployment** — not Easy-level UI bugs.  
General IC tasks remain in `TASKS.md` (not required for this session).

Reproduce issues before fixing. Explain trade-offs and what you would **not** change in week one.

---

## Session structure (interviewer)

| Block                | Time      | Pick                                               |
| -------------------- | --------- | -------------------------------------------------- |
| Context              | 10 min    | `docs/ARCHITECTURE.md` + skim `docker-compose.yml` |
| Practical coding     | 35–45 min | **2** from Part A                                  |
| Deployment practical | 25–35 min | **2** from Part B                                  |
| Leadership & design  | 20–30 min | **2** from Part C                                  |

---

## Part A — Practical coding (pick 2)

### L-P1 — Team search security (M3)

**Description:** Team search may be vulnerable to injection.

**Expected:** Parameterized queries only; malicious input cannot alter query structure.

**Acceptance criteria:**

- Search uses bound parameters
- You can explain how you verified the fix
- You state rollout risk (auth, logging, backfill) if this were already in production

---

### L-P2 — API contract governance (M6)

**Description:** Frontend and backend disagree on response envelopes (`{ data }` vs raw arrays).

**Expected:** One predictable contract per endpoint; clients updated consistently.

**Acceptance criteria:**

- Teams (and at least one other endpoint) aligned with documented shape
- You describe how the team prevents drift (tests, OpenAPI, CI, etc.)

---

### L-P3 — API blocks under load (H3)

**Description:** Percentile/metrics work blocks the Node event loop on large payloads.

**Expected:** Non-blocking or bounded work; API stays responsive.

**Acceptance criteria:**

- Algorithm or execution model improved (async worker, better sort, limit input size)
- You explain how you would monitor this in production

---

### L-P4 — Team detail performance (M7 + DB)

**Description:** Team detail is slow with many members (N+1 pattern).

**Expected:** Efficient query strategy; acceptable latency at ~20+ members.

**Acceptance criteria:**

- Query count does not scale linearly with member count
- You mention indexes/migrations if relevant

---

## Part B — Deployment practical (pick 2)

Use the existing `docker/` folder, `docker-compose.yml`, and `npm run interview` stack as the baseline.

### L-D1 — Production readiness audit

**Description:** The current Docker setup targets **local interviews**, not production.

**Task:** Review `docker-compose.yml`, `docker/backend.Dockerfile`, `docker/frontend.Dockerfile`, and `docker/backend-entrypoint.sh`. Produce a short **Production gaps** list (minimum **5** concrete items).

**Examples to look for (do not limit yourself to these):**

- Dev servers vs production builds
- Secrets in compose files
- Volume mounts suitable only for dev
- Seed-on-every-start behavior
- Missing health checks / restart policies
- CORS and TLS termination

**Deliverable:** `docs/PRODUCTION_GAPS.md` (create this file) OR a commented section at the top of a `docker-compose.prod.yml` if you prefer.

**Acceptance criteria:**

- Each gap states **risk** and **recommended fix**
- Prioritized (P0/P1/P2) with one-line rationale

---

### L-D2 — Backend container health & startup

**Description:** Backend has no Docker healthcheck; frontend may start before API is ready.

**Task:**

1. Add a **healthcheck** to the `backend` service in Docker (use `/api/health` or equivalent).
2. Make `frontend` wait for backend health (compose `depends_on` with condition).
3. Ensure the health endpoint reflects DB connectivity (or document why not).

**Acceptance criteria:**

- `docker compose up` — frontend does not serve until backend health passes
- Healthcheck documented in your PR/commit message or `PRODUCTION_GAPS.md`

---

### L-D3 — Production entrypoint behavior

**Description:** `docker/backend-entrypoint.sh` runs **migrations, seed, and `npm run dev`** on every start.

**Task:** Propose and implement a **production-safe** entrypoint strategy:

- When to run migrations
- When **not** to auto-seed
- `dev` vs `start` (compiled) for the API process

**Deliverable:** Updated `docker/backend-entrypoint.sh` and/or a new `docker/backend-entrypoint.prod.sh` plus notes in `docs/PRODUCTION_GAPS.md`.

**Acceptance criteria:**

- Clear separation of dev vs prod behavior (env flag is fine, e.g. `RUN_SEED=true`)
- You explain rollback if a migration fails mid-deploy

---

### L-D4 — CI pipeline (GitHub Actions)

**Description:** There is no CI workflow in the repo.

**Task:** Add `.github/workflows/ci.yml` that runs on pull requests to `main` / `interview-lead`:

- `npm ci`
- `npm run lint` (or workspace lint)
- `npm run typecheck` (if present)
- `npm run build` for workspaces

**Acceptance criteria:**

- Workflow is valid YAML and would run on PR
- You explain what you would add next (Docker build, migration check, contract tests)

---

### L-D5 — Frontend production image

**Description:** `docker/frontend.Dockerfile` runs **Vite dev server**, not a static production build.

**Task:** Sketch or implement a **production** frontend image approach:

- Multi-stage build: `npm run build`, serve with `nginx` or `vite preview` behind a reverse proxy
- `VITE_API_URL` set at **build time** — document implications

**Deliverable:** `docker/frontend.Dockerfile.prod` or updated Dockerfile + short note in `docs/PRODUCTION_GAPS.md`.

**Acceptance criteria:**

- No dev volume mounts in your prod design
- You explain how API URL is configured in staging vs production

---

### L-D6 — Deploy runbook (written)

**Description:** Your platform team asks for a one-page runbook before go-live.

**Task:** Write `docs/DEPLOY_RUNBOOK.md` covering:

- Prerequisites (secrets, DBs, image registry)
- Deploy steps (order: migrate → backend → frontend)
- Smoke tests (`/api/health`, login, one read path)
- Rollback plan
- What to monitor first 24h

**Acceptance criteria:**

- Runnable by another engineer without reading the whole codebase
- Calls out DevHub-specific risks (dual DB, seed data, JWT rotation)

---

## Part C — Leadership & architecture (discussion, pick 2)

No code required unless you choose to sketch in the doc.

### L-C1 — Plugin registry lifecycle (S1)

`plugins/registry.ts` — registration timing, extension model, safe third-party plugins.

### L-C2 — Observability strategy (S3)

Structured logging, correlation IDs, metrics vs traces for DevHub.

### L-C3 — Multi-database architecture (S4)

Postgres + Mongo split — consistency, failure modes, when to merge or add a bus.

### L-C4 — API contract governance at scale (S5)

Preventing shared-types drift; breaking change policy across teams.

### L-C5 — Prioritization exercise

Given L-D1 gaps and L-P1/L-P2 security/contract issues, **what ships in week 1 vs week 4?** Who owns each item?

### L-C6 — Team execution

How would you split Part B work across two engineers? What do you review in PR vs delegate?

---

## Take-home variant (4–6 hours)

- Part A: **3** tasks
- Part B: **3** tasks (must include **L-D4** CI and **L-D6** runbook)
- Part C: written answers for **3** discussion prompts

---

## What we evaluate (lead)

| Signal       | Strong                               | Weak                              |
| ------------ | ------------------------------------ | --------------------------------- |
| Security     | Fixes root cause; plans rollout      | Patches symptom only              |
| Deployment   | Dev vs prod clarity; safe migrations | “Just docker compose up”          |
| Architecture | Trade-offs, boundaries, operability  | Buzzwords without ties to code    |
| Leadership   | Prioritization, delegation, risk     | Only individual contributor fixes |

---

## Environment

Same as general interviews: **Codespaces** on branch **`interview-lead`**, or `npm run interview` locally.

Login: `engineer@devhub.local` / `devhub123`
