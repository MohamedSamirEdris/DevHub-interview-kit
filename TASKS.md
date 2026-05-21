# DevHub Interview Tasks

Work through these tasks as you would in a real engineering sprint. Reproduce issues before fixing them. Document assumptions.

**Do not expect every bug to surface immediately** — explore setup, navigation, network tab, and server logs.

Reproduce each symptom before changing code. Do not rely on `BUG` markers in source — they are for maintainers only and carry no explanation.

---

## Easy

### E1 — Login does not complete reliably

**Description:** Signing in sometimes fails to enter the app, or errors are swallowed.

**Expected behavior:** After valid credentials, user is authenticated and redirected to Teams.

**Acceptance criteria:**
- Login awaits async completion before navigation
- Errors from failed login display to the user
- Successful login persists session

---

### E2 — Teams sort breaks list updates

**Description:** Sorting teams on the Teams page causes odd UI behavior or stale order.

**Expected behavior:** Sorting creates a new ordered list without mutating cached data.

**Acceptance criteria:**
- React Query cache is not mutated in place
- Sort toggle works repeatedly without side effects

---

### E3 — Settings form does not reflect user

**Description:** Profile settings inputs do not stay in sync with the logged-in user.

**Expected behavior:** Display name reflects current user; session warning only when logged out.

**Acceptance criteria:**
- Controlled inputs OR correct default sync on user load
- Error message shown only when there is no session

---

### E4 — Services table React warnings

**Description:** Console shows list/key warnings on the Services catalog page.

**Expected behavior:** Stable keys for each row; no React key warnings.

**Acceptance criteria:**
- Each table row has a unique `key`
- No duplicate key warnings in console

---

### E5 — Teams cards missing keys

**Description:** React warnings when rendering the teams grid.

**Acceptance criteria:**
- Each `TeamCard` has a stable `key` prop

---

### E6 — Wrong HTTP semantics on auth failure

**Description:** Review auth error responses for consistency with REST conventions.

**Acceptance criteria:**
- Invalid credentials return appropriate status (not misleading success)
- Response shape is consistent with other auth endpoints

---

## Medium

### M1 — Search page freezes or loops

**Description:** Typing in global Search causes performance issues or infinite requests.

**Expected behavior:** Debounced search with stable effect dependencies; no infinite loop.

**Acceptance criteria:**
- `useEffect` has correct dependency array
- Requests debounced (~300ms)
- In-flight requests cancelled or ignored when query changes

---

### M2 — Duplicate service catalog fetches

**Description:** Services page triggers redundant network calls.

**Expected behavior:** React Query cache used; manual refresh does not duplicate uncached fetches.

**Acceptance criteria:**
- Sensible `refetchOnMount` / `refetchOnWindowFocus` settings
- Refresh button uses query client correctly

---

### M3 — Team search API security review

**Description:** Team search may be vulnerable to injection attacks.

**Expected behavior:** Parameterized queries only; no string interpolation in SQL.

**Acceptance criteria:**
- Search uses bound parameters
- Malicious input cannot alter query structure

---

### M4 — Log search security review

**Description:** Log search endpoint accepts free-text queries.

**Expected behavior:** Safe MongoDB query (no `$where` with user input).

**Acceptance criteria:**
- Uses indexed text search or regex with escaping
- Injection-style payloads do not execute arbitrary logic

---

### M5 — CORS / middleware ordering

**Description:** Some browsers report CORS issues on certain API paths.

**Expected behavior:** CORS middleware applied before route handlers.

**Acceptance criteria:**
- Preflight succeeds for authenticated routes
- `OPTIONS` requests handled correctly

---

### M6 — Inconsistent API response envelopes

**Description:** Frontend must handle multiple response shapes.

**Expected behavior:** Document and align on `{ data, meta? }` OR migrate clients consistently.

**Acceptance criteria:**
- Teams list matches documented contract
- Frontend API layer handles one predictable shape per endpoint

---

### M7 — N+1 queries loading team detail

**Description:** Team detail endpoint is slow with many members.

**Expected behavior:** Single query or JOIN loads members efficiently.

**Acceptance criteria:**
- Member count does not equal query count
- Response time acceptable for 20+ members

---

### M8 — Debounce hook cleanup

**Description:** `useDebounce` may update state after unmount.

**Acceptance criteria:**
- `clearTimeout` in effect cleanup
- No state updates after unmount

---

### M9 — useTeamCount memory leak

**Description:** Hook may set state after component unmounts.

**Acceptance criteria:**
- Abort/cancel flag set in cleanup

---

### M10 — Pagination limit abuse

**Description:** Services list accepts unbounded `limit` query param.

**Acceptance criteria:**
- Server enforces max page size (e.g. 100)
- Client uses reasonable defaults

---

### M11 — last_login race on auth

**Description:** Concurrent logins may leave inconsistent `last_login`.

**Acceptance criteria:**
- `last_login` update awaited or handled in transaction

---

## Hard

### H1 — Services catalog performance

**Description:** Large table on Services page is sluggish when filtering/sorting.

**Expected behavior:** Smooth scrolling and interaction for 100+ rows.

**Acceptance criteria:**
- Virtualization OR reduced row expansion
- Expensive stats memoized
- No O(n²) work per keystroke in filter path

---

### H2 — Metrics page render cost

**Description:** Metrics dashboard feels heavy when data loads.

**Acceptance criteria:**
- Chart aggregation memoized
- Avoid unnecessary recomputation each render

---

### H3 — Percentile endpoint blocks under load

**Description:** `/api/metrics/percentile` slows entire API when called with large datasets.

**Expected behavior:** Non-blocking percentile calculation.

**Acceptance criteria:**
- Efficient sort algorithm OR worker/async offload
- Event loop remains responsive

---

### H4 — Request logger listener leak

**Description:** Long-running dev server shows `MaxListenersExceededWarning`.

**Acceptance criteria:**
- Listeners not registered per request
- Or cleanup on server shutdown

---

### H5 — Auth middleware hardening

**Description:** Review JWT validation edge cases.

**Acceptance criteria:**
- Expired tokens rejected
- Clear 401 vs 403 semantics

---

## Bonus

### B1 — Legacy Postgres pool env typo

**Description:** A deprecated module may not pick up `PG_CONNECTION_STRING`.

**Acceptance criteria:**
- Env variable name consistent across codebase
- Legacy module documented or removed

---

### B2 — Database indexes

**Description:** Improve slow queries identified in team/service paths.

**Acceptance criteria:**
- Indexes on foreign keys and search columns
- `EXPLAIN` shows index usage

---

### B3 — Denormalized `team_name` on services

**Description:** `services.team_name` can drift from `teams.name`.

**Acceptance criteria:**
- Propose normalization strategy OR sync mechanism
- Document trade-offs

---

### B4 — Route-level code splitting

**Description:** Initial bundle loads all pages upfront.

**Acceptance criteria:**
- Lazy-loaded routes with `React.lazy` + `Suspense`
- Measurable bundle size reduction

---

### B5 — Add rate limiting to auth routes

**Acceptance criteria:**
- Basic rate limit on `/api/auth/login`
- Returns 429 when exceeded

---

## Senior Discussion

### S1 — Plugin registry lifecycle

**Description:** `plugins/registry.ts` exists but plugins registered after boot are ignored.

**Discussion topics:**
- Plugin discovery vs registration timing
- Backstage-style extension model
- Versioning and isolation

---

### S2 — Feature folder boundaries

**Description:** Pages mix data fetching, presentation, and business logic.

**Discussion topics:**
- Feature-sliced design
- Where to place hooks and API modules
- Testability

---

### S3 — Observability strategy

**Description:** Logging is ad hoc; no correlation IDs.

**Discussion topics:**
- Structured logging
- Metrics vs traces
- What to log in production

---

### S4 — Multi-database architecture

**Description:** Postgres for relational data, Mongo for time-series/logs.

**Discussion topics:**
- When to split databases
- Consistency across stores
- CQRS / read models

---

### S5 — API contract governance

**Description:** Shared types drift from runtime responses.

**Discussion topics:**
- Contract testing
- OpenAPI vs TypeScript packages
- Breaking change policy

---

### S6 — `motion-root` custom elements

**Description:** Some components use non-standard `motion-root` tags.

**Discussion topics:**
- HTML validity and accessibility
- Design system enforcement
- Lint rules for custom elements

---

## Take-home extension ideas

- Add service detail page with ownership graph
- Implement audit log plugin using `plugins/registry.ts`
- Add E2E tests for login + search flows
- Add OpenAPI spec generated from shared types
