# Candidate setup guide (`interview` branch)

Goal: **no PostgreSQL/MongoDB installs on your machine** — use Codespaces or Docker as directed by your interviewer.

---

## Recommended approaches (pick one)

### 1. You host, candidate pairs (fastest — zero candidate install)

**Best for:** live 60–90 min interviews.

1. On **your** machine: install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Run:

```bash
npm run interview
```

3. Open http://localhost:5173 and share your screen (or give them control).
4. Candidate only needs their editor if they edit your machine; otherwise they can code in your IDE.

**Pros:** No candidate environment issues. **Cons:** Candidate doesn’t run the app locally.

---

### 2. Docker one-command (best when candidate has Docker)

**Best for:** take-home, or candidates who already use Docker.

**Candidate instructions (copy-paste):**

```bash
git clone <repo-url>
cd devhub-interview-kit
npm run interview
```

First run downloads images (~2–5 min). Later runs are faster.

| URL | |
|-----|---|
| App | http://localhost:5173 |
| Login | `engineer@devhub.local` / `devhub123` |

Stop: `Ctrl+C` or `npm run interview:down`

**Requires:** Docker Desktop only (not separate Postgres/Mongo installs).

---

### 3. GitHub Codespaces (browser only) — recommended

1. Open **[docs/CODESPACES.md](CODESPACES.md)** or use the Codespaces link in the README (branch **`interview`**).
2. Wait for setup (~3–8 min first time).
3. **Ports** tab → open port **5173** in browser.
4. Log in: `engineer@devhub.local` / `devhub123`.
5. Work from **`TASKS.md`**.

**Requires:** GitHub account + repo access. No local installs.

---

## Your checklist

- [ ] Open Codespace on branch **`interview`** (or run Docker if instructed)
- [ ] Confirm port **5173** opens the app
- [ ] Read assigned tasks in `TASKS.md`
- [ ] Reproduce each issue before fixing

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `docker: command not found` | Install Docker Desktop, or use Codespaces / you host |
| `Docker is installed but not running` | Start Docker Desktop |
| Port 5173 / 4000 in use | `npm run interview:down`, kill other dev servers |
| Slow first start | Normal — images + `npm ci` in containers |
| Candidate on Windows | Docker Desktop + WSL2 backend (default) |

---

## Local dev (optional — for maintainers)

If you prefer native Postgres/Mongo without Docker, see the root `README.md` “Quick start” section. **Not recommended for interviews.**
