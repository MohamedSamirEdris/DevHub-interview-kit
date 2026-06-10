# DevHub Interview Kit — Answers Guide

**Interviewer only.** Do not share with candidates during live sessions.

This guide maps tasks to intentional issues, discovery hints, and acceptable solutions.

**Source code:** Interview spots are marked with `// BUG` (or `{/* BUG */}`) only — no description in code. Use this guide for task mapping, hints, and grading. Candidates work from `TASKS.md` and reproduction, not from inline explanations.

---

## How to use this guide

| Signal | Strong candidate | Weak candidate |
|--------|------------------|----------------|
| Debugging | Reproduces in browser + network + logs | Guesses without repro |
| Fix quality | Minimal, targeted diff | Unrelated refactors |
| Communication | States trade-offs | Silent code dumps |
| Security | Parameterized queries | Only patches symptoms |

---

## Easy tasks

### E1 — Login does not complete reliably

**Location:** `apps/frontend/src/pages/LoginPage.tsx`

**Issue:** `login(credentials)` called without `await`; `finally` runs before auth finishes; errors not caught from rejected promise.

**Why it happens:** Async function treated as fire-and-forget.

**Discovery:** Network tab shows 200 but redirect fails intermittently; React Query/auth state updates after navigation attempt.

**Solutions (any valid):**
1. `await login(credentials)` inside try/catch
2. Return promise from handler and use `mutateAsync` pattern
3. Navigate in `AuthContext` after login resolves

**Recommended:** `await login(...)` + only navigate when `isAuthenticated` via effect or `useNavigate` after await.

**Alternatives:** React Query `useMutation` for login form.

**Strong candidates say:** Race between token write and route guard; mention testing with network throttling.

**Weak candidates miss:** Only add `await` without error handling.

---

### E2 — Teams sort breaks list updates

**Location:** `apps/frontend/src/pages/TeamsPage.tsx` — `sortTeamsInPlace`

**Issue:** `Array.sort` mutates React Query cached array in place.

**Why:** Sort returns same reference; React may skip re-render; cache corrupted for other consumers.

**Discovery:** Sort twice → odd order; React Query devtools shows mutated cache.

**Solutions:**
1. `[...teams].sort(...)` copy first
2. `useMemo(() => [...teams].sort(), [teams, sortOrder])`
3. Sort on server

**Recommended:** Immutable copy before sort.

**Strong:** Explains referential equality + Query cache immutability.

**Weak:** Calls `.sort()` without copy.

---

### E3 — Settings form does not reflect user

**Location:** `apps/frontend/src/pages/SettingsPage.tsx`

**Issues:**
1. `defaultValue` on uncontrolled inputs — won't update when user loads async
2. `{!user && <span>No user session</span>}` inverted — shows error when logged in

**Solutions:**
1. Controlled inputs: `value={user?.name ?? ''}` + `onChange`
2. Fix conditional to `{!user && ...}` → remove or use `{!user && ...}` correctly as `{user ? null : <span>...}`

**Recommended:** Controlled fields + fix conditional.

**Strong:** Mentions `key={user?.id}` remount pattern as alternative for uncontrolled forms.

---

### E4 / E5 — Missing React keys

**Locations:**
- `ServicesPage.tsx` — `<tr>` without `key`
- `TeamsPage.tsx` — `TeamCard` without `key` in map

**Recommended:** `key={service.id}` (note expanded rows use synthetic ids — discuss uniqueness).

**Strong:** Warns duplicate keys when `generateDisplayRows` clones ids with suffix.

---

### E6 — Auth HTTP semantics

**Location:** `apps/backend/src/routes/auth.ts`

**Issues:**
1. Failed login should return **401 Unauthorized** with a consistent JSON error body (not 200, not ambiguous shapes).
2. Success response should match the API envelope used elsewhere (`{ data: { token, user } }` or documented auth shape).
3. Align with **M6** — teams route returns a raw array while auth may use a different pattern.

**Discovery:** Network tab on bad password — check status code and body. Compare with `/api/teams` response shape.

**Recommended fix (failure path):**
```ts
return res.status(401).json({
  error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
});
```

**Recommended fix (success path):**
```ts
return res.status(200).json({
  data: { token, user: { id, email, name, role } },
});
```

Update `AuthContext` / `LoginPage` client parsing if envelope changes.

**Strong:** Mentions RFC 7235, no user enumeration (same message for unknown email vs bad password), rate limiting (B5).

**Weak:** Changes message text only; leaves 200 on failure or inconsistent envelope.

**Note:** If candidate reports 200 on failure, verify they're hitting the login handler — not a proxy error page or cached response.

---

## Medium tasks

### M1 — Search page freezes or loops

**Location:** `apps/frontend/src/pages/SearchPage.tsx`

**Issues:**
1. `useEffect` with **no dependency array** → runs every render
2. `setQuery(query)` inside effect → infinite loop
3. No debounce

**Recommended fix:**
```tsx
const debouncedQuery = useDebounce(query, 300);
useEffect(() => {
  if (!debouncedQuery.trim()) { ... return; }
  let cancelled = false;
  // fetch...
  return () => { cancelled = true; };
}, [debouncedQuery]);
```

**Also fix:** `useDebounce.ts` missing `clearTimeout` cleanup.

**Strong:** Mentions AbortController for fetch cancellation.

**Weak:** Only adds `[]` deps but keeps `setQuery` inside effect.

---

### M2 — Duplicate service fetches

**Location:** `apps/frontend/src/pages/ServicesPage.tsx`

**Issues:** `refetchOnMount: 'always'`, `refetchOnWindowFocus: true`, `handleRefresh` calls `fetchServices` outside Query.

**Recommended:** Default query options; `refetch()` only in handler.

---

### M3 — SQL injection in team search

**Location:** `apps/backend/src/services/teamService.ts` — `searchTeams`

**Issue:** Template literal interpolates `searchTerm` into SQL.

**Recommended:** `WHERE name ILIKE $1` with `[%${term}%]` as parameter (still use parameterized `%` value).

**Strong:** Demonstrates payload `%' OR '1'='1`; discusses defense in depth.

**Weak:** Escapes quotes only without parameterization.

---

### M4 — MongoDB `$where` injection

**Location:** `apps/backend/src/services/metricsService.ts` — `searchLogs`

**Recommended:**
```ts
db.collection('logs').find({
  message: { $regex: escapeRegex(queryText), $options: 'i' },
  ...(level && { level }),
})
```
Or text index `$text: { $search: ... }`.

**Strong:** Explains why `$where` is disabled in hardened clusters.

---

### M5 — CORS middleware order

**Location:** `apps/backend/src/app.ts`

**Issue:** `cors()` registered **after** routes.

**Recommended:** Move `cors()` before `app.use('/api/...')`.

**Discussion:** Some responses may still work due to simple GET but preflight fails.

---

### M6 — Inconsistent API envelopes

**Locations:**
- `teams.ts` route returns raw array
- `auth`, `services`, `metrics` use `{ data }`

**Solutions:**
1. Wrap teams in `{ data: teams }` (breaking — update frontend `fetchTeams`)
2. Normalize in frontend API client

**Recommended:** Standardize on `{ data, meta? }` across API; version if needed.

---

### M7 — N+1 team members

**Location:** `apps/backend/src/services/teamService.ts` — `getTeamById`

**Recommended:**
```sql
SELECT tm.*, u.name, u.email, u.role
FROM team_members tm
JOIN users u ON u.id = tm.user_id
WHERE tm.team_id = $1
```

**Also:** Add index on `team_members(team_id)` in migration.

---

### M8 / M9 — Hook cleanup

**Locations:** `useDebounce.ts`, `useTeamCount.ts`

**Recommended:**
```ts
useEffect(() => {
  const t = setTimeout(...);
  return () => clearTimeout(t);
}, [value, delay]);
```

```ts
useEffect(() => {
  let cancelled = false;
  fetchTeams().then(...);
  return () => { cancelled = true; };
}, []);
```

---

### M10 — Pagination limit

**Location:** `apps/backend/src/routes/services.ts`

**Recommended:** `const limit = Math.min(parseInt(...) || 20, 100);`

---

### M11 — last_login race

**Location:** `apps/backend/src/services/authService.ts`

**Recommended:** `await query('UPDATE users SET last_login = NOW() ...')`

---

## Hard tasks

### H1 — Services catalog performance

**Locations:** `ServicesPage.tsx` — `generateDisplayRows`, `computeTierStats`, missing keys

**Issues:**
- Artificial 8x row expansion (~120 rows)
- `computeTierStats` O(n × 1000) nested loop every render
- No virtualization

**Solutions:**
1. Remove expansion in prod / feature flag
2. `useMemo` for filtered rows and stats
3. `@tanstack/react-virtual` or `react-window`

**Recommended combo:** Memoize + remove fake expansion + virtualize if keeping large lists.

**Strong:** Profiles with React Profiler; discusses pagination vs virtualization.

---

### H2 — Metrics render cost

**Location:** `MetricsPage.tsx` — `chartPoints` not memoized

**Recommended:** `useMemo(() => ..., [metrics])`

---

### H3 — Event loop blocking percentile

**Location:** `apps/backend/src/services/metricsService.ts` — `computeExpensivePercentile`

**Issue:** Bubble sort O(n²) on request thread.

**Solutions:**
1. `values.sort((a,b) => a-b)` + index pick
2. `setImmediate` chunking
3. Worker thread

**Recommended:** Built-in sort for interview scope; worker for production scale.

---

### H4 — Request logger leak

**Location:** `apps/backend/src/middleware/requestLogger.ts`

**Issue:** `requestEvents.on('log-batch', ...)` inside middleware — new listener per request.

**Recommended:** Remove per-request listener; register once at startup.

---

### H5 — Auth middleware

**Location:** `apps/backend/src/middleware/auth.ts`

**Discussion:** `jwt.verify` already checks `exp` if present — candidate may propose explicit `exp` check, refresh tokens, or `algorithms` option.

**Minor:** Missing `return` after 401 in catch block — style/issue for linters.

---

## Bonus tasks

### B1 — Legacy env typo

**Location:** `apps/backend/src/db/postgres-legacy.ts` — `PG_CONECTION_STRING`

**Fix:** Rename to `PG_CONNECTION_STRING` or remove legacy module.

---

### B2 — Database indexes

**Location:** `apps/backend/src/scripts/migrate.ts`

**Add:**
```sql
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE UNIQUE INDEX idx_teams_slug_unique ON teams(slug);
CREATE INDEX idx_services_slug ON services(slug);
```

**Discuss:** denormalized `team_name` on services (B3).

---

### B3 — Denormalized team_name

**Options:**
1. Drop column; always JOIN
2. Trigger to sync on team rename
3. Materialized view

**Strong:** CAP trade-off, read vs write optimization.

---

### B4 — Code splitting

**Recommended:**
```tsx
const TeamsPage = lazy(() => import('./pages/TeamsPage'));
// Suspense fallback in route
```

---

### B5 — Rate limiting

**Recommended:** `express-rate-limit` on auth router.

---

## Senior discussion

### S1 — Plugin registry

**Location:** `apps/backend/src/plugins/registry.ts`

**Issue:** No dynamic loading; plugins must register before `loadPlugins` call; no hook in `index.ts` currently.

**Discussion:** Backstage plugin model, DI containers, lazy `import()`, feature flags.

---

### S2 — Feature boundaries

**Observation:** API clients flat in `api/`; pages own fetching + UI.

**Strong proposals:** `features/teams/{api,components,hooks}`, colocation, barrel exports.

---

### S3 — Observability

**Gaps:** `requestLogger` console only; no correlation ID; `metrics` avg latency hardcoded.

**Discussion:** OpenTelemetry, pino, requestId middleware.

---

### S4 — Multi-DB

**Current split:** OLTP in Postgres; telemetry in Mongo.

**Discussion:** Event-driven sync, idempotency, eventual consistency for dashboards.

---

### S5 — Contract governance

**Gap:** `fetchTeams` expects array; types say `ApiResponse<T>` exists but unused.

**Discussion:** zod at boundary, openapi-typescript, CI contract tests.

---

### S6 — `motion-root` elements

**Locations:** Partial migration artifact — invalid HTML5 (unknown element behaves like inline).

**Fix:** Replace with `div` or registered custom element + shadow DOM if intentional.

**Interview value:** Candidate notices layout/CSS not applying to `motion-root` in some browsers.

---

## Bug catalog (quick reference)

| ID | Area | File | Severity |
|----|------|------|----------|
| FE-01 | Login await | LoginPage.tsx | Easy |
| FE-02 | Cache mutation | TeamsPage.tsx | Easy |
| FE-03 | Settings form | SettingsPage.tsx | Easy |
| FE-04 | Missing keys | ServicesPage.tsx | Easy |
| FE-05 | Missing keys | TeamsPage.tsx | Easy |
| FE-06 | Search loop | SearchPage.tsx | Medium |
| FE-07 | Debounce cleanup | useDebounce.ts | Medium |
| FE-08 | Team count leak | useTeamCount.ts | Medium |
| FE-09 | Duplicate fetch | ServicesPage.tsx | Medium |
| FE-10 | Perf table | ServicesPage.tsx | Hard |
| FE-11 | Metrics memo | MetricsPage.tsx | Hard |
| BE-01 | SQL injection | teamService.ts | Medium |
| BE-02 | NoSQL injection | metricsService.ts | Medium |
| BE-03 | N+1 | teamService.ts | Medium |
| BE-04 | CORS order | app.ts | Medium |
| BE-05 | API shape | teams route | Medium |
| BE-06 | Pagination | services route | Medium |
| BE-07 | last_login | authService.ts | Medium |
| BE-08 | Event loop | metricsService.ts | Hard |
| BE-09 | Listener leak | requestLogger.ts | Hard |
| BE-10 | Env typo | postgres-legacy.ts | Easy |
| DB-01 | Missing indexes | migrate.ts | Bonus |
| DB-02 | Denorm team_name | services table | Bonus |

---

## Scoring rubric (suggested)

| Level | Expectation |
|-------|-------------|
| Junior | 2–4 Easy tasks with guidance |
| Mid | Easy + 3+ Medium; begins Hard |
| Senior | Medium + Hard; articulates S1–S6 |
| Staff+ | Architecture discussion + production hardening plan |

---

## Known false positives

- **StrictMode double fetch** in dev — not a bug
- **Mongo avg latency static** — seed/demo only; task H2/M metrics discussion
- **motion-root** — may render in browsers as unknown elements; discuss vs fix

---

## Post-interview debrief prompts

1. Which bug would you ship-fix first in production? Why?
2. How would you prevent regression (tests, lint rules)?
3. What would you monitor after deploying fixes to search/auth?
