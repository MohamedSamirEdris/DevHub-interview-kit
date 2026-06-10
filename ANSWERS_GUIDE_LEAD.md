# DevHub Technical Lead — Answers Guide

**Interviewer only.** Pair with `TASKS_LEAD.md` on branch **`interview-lead`**.

---

## Scoring rubric (lead)

| Area | Strong lead | Weak lead |
| ---- | ----------- | --------- |
| Security (L-P1) | Parameterized SQL + rollout/monitoring plan | String concat “fix” only |
| Contracts (L-P2) | End-to-end alignment + governance proposal | Frontend hack without API change |
| Performance (L-P3/L-P4) | Bounded work + observability | Micro-optimize without measuring |
| Deployment (L-D*) | Dev/prod separation, safe migrations | Treats interview compose as prod-ready |
| Leadership (L-C*) | Prioritizes risk, delegates, communicates | Only codes in silence |

---

## Part A — Practical coding

### L-P1 — Team search security (M3)

**Location:** `apps/backend/src/services/teamService.ts` — `searchTeams`

**Issue:** SQL built with string interpolation from user input.

**Recommended:**
```ts
const result = await pool.query(
  `SELECT ... FROM teams WHERE name ILIKE $1 OR slug ILIKE $1`,
  [`%${q}%`],
);
```

**Strong:** Discuss ILIKE wildcard escaping, input length limits, audit logging for auth routes.

**Weak:** Client-side validation only.

---

### L-P2 — API contract governance (M6)

**Locations:** `apps/backend/src/routes/teams.ts`, `apps/frontend/src/api/teams.ts`

**Issue:** Teams route returns raw array; other routes use `{ data, meta? }`; shared types include `ApiResponse<T>` but unused.

**Recommended:** Standardize on `{ data: Team[] }` (and `meta` if paginated); update `fetchTeams` and consumers.

**Governance (discussion):** zod parse at route boundary, OpenAPI diff in CI, codegen from spec.

---

### L-P3 — Event loop (H3)

**Location:** `apps/backend/src/services/metricsService.ts` — `computeExpensivePercentile` (bubble-style sort on main thread).

**Recommended:** `Array.sort`, cap array size, or offload to worker thread / queue job for large N.

**Strong:** p99 latency metric, request timeout, load test mention.

---

### L-P4 — N+1 (M7)

**Location:** `teamService.getTeamById` — per-member queries.

**Recommended:** Single JOIN or `WHERE team_id = $1` for all members.

**Index:** `team_members(team_id)` — see `migrate.ts` / task B2.

---

## Part B — Deployment practical

### L-D1 — Production gaps (expected findings)

| Priority | Gap | Risk | Fix direction |
| -------- | --- | ---- | ------------- |
| P0 | `JWT_SECRET` / DB passwords in compose | Credential leak | Secrets manager / env injection |
| P0 | `npm run seed` every container start | Data overwrite, unsafe prod | Seed only in dev; one-off job |
| P0 | Backend runs `npm run dev` in entrypoint | No stability, no cluster restarts | `npm run build` + `npm start` |
| P0 | Frontend Dockerfile runs Vite dev | Perf, HMR, wrong asset paths | Static build + nginx |
| P1 | Bind-mount `.:/app` | Non-reproducible images | Copy source in build stage only |
| P1 | Postgres/Mongo ports published | Attack surface | Internal network only |
| P1 | No backend healthcheck | Race on startup | HTTP health + compose condition |
| P1 | `CORS_ORIGIN` localhost only | Broken prod SPA | Env per environment |
| P2 | No resource limits | Noisy neighbor | CPU/memory in compose/k8s |
| P2 | No CI/CD | Regressions ship | L-D4 workflow |

Accept partial lists if reasoning is strong and prioritized.

---

### L-D2 — Backend healthcheck

**Example compose snippet:**
```yaml
backend:
  healthcheck:
    test: ['CMD', 'wget', '-qO-', 'http://localhost:4000/api/health']
    interval: 5s
    timeout: 3s
    retries: 10
frontend:
  depends_on:
    backend:
      condition: service_healthy
```

**Note:** Alpine may need `wget`/`curl` in image; or use `node -e` HTTP check.

**Enhancement:** `/api/health` returns DB status (optional stretch).

---

### L-D3 — Entrypoint

**Recommended pattern:**
```sh
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then npm run db:migrate -w @devhub/backend; fi
if [ "${RUN_SEED:-false}" = "true" ]; then npm run seed -w @devhub/backend; fi
if [ "${NODE_ENV}" = "production" ]; then
  npm run build -w @devhub/backend && exec npm run start -w @devhub/backend
else
  exec npm run dev -w @devhub/backend
fi
```

**Rollback:** Failed migration → do not route traffic; restore DB snapshot; redeploy previous image tag.

---

### L-D4 — CI workflow

Minimum:
```yaml
name: CI
on:
  pull_request:
    branches: [main, interview, interview-lead]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
```

**Next steps (strong candidates):** `docker build`, smoke test compose, migration dry-run.

---

### L-D5 — Frontend prod image

**Pattern:** Stage 1 `npm ci && npm run build -w @devhub/frontend`; Stage 2 `nginx:alpine` copy `dist/`.

**Build-time `VITE_API_URL`:** Must match public API URL; document rebuild per environment.

**Proxy:** nginx `location /api { proxy_pass backend:4000; }` or separate API host with CORS.

---

### L-D6 — Deploy runbook

**Must include:** secret list, migration before traffic, health gate, smoke tests (health + login + teams list), rollback (previous image + DB restore policy), monitors (5xx rate, latency, DB connections, Mongo disk).

---

## Part C — Discussion prompts (guide)

### L-C5 — Prioritization (example strong answer)

**Week 1:** L-P1 SQL injection, secrets out of compose, disable prod seed, JWT from vault.  
**Week 2:** L-P2 contract alignment + CI (L-D4).  
**Week 3–4:** H3 perf, observability (S3), plugin model (S1).

**Weak:** Random order; no risk framing.

### L-C6 — Delegation

**Strong:** Senior owns entrypoint/CI; mid owns healthcheck + compose; lead reviews threat model and runbook.

---

## Debrief prompts (lead)

1. What would you block a release on vs waive with a ticket?
2. How do you teach the team to avoid the SQL injection class of bugs?
3. Single biggest operational risk in DevHub’s dual-DB design?
4. How would DevHub deploy on Kubernetes vs managed PaaS — one choice and why?
