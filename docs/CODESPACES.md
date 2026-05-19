# GitHub Codespaces setup (interviewers)

Candidates only need a **GitHub account and a browser**. No Docker, PostgreSQL, or MongoDB on their laptop.

---

## Candidate quick start

Send candidates this link after you give them repo access:

https://codespaces.new/MohamedSamirEdris/DevHub-interview-kit?quickstart=1

What happens automatically:

1. GitHub creates a Codespace from `.devcontainer/devcontainer.json`.
2. Dependencies install with `npm install`.
3. PostgreSQL and MongoDB start as **Docker containers** inside the Codespace (no `ghcr.io` devcontainer “postgres” feature, so pulls are less likely to fail).
4. Database migrations and seed data run.
5. DevHub starts automatically and forwards port **5173**.

Candidate login:

| Field    | Value                                         |
| -------- | --------------------------------------------- |
| URL      | Port **5173** in the Codespaces **Ports** tab |
| Email    | `engineer@devhub.local`                       |
| Password | `devhub123`                                   |

If the app is not open yet, use **Ports -> 5173 -> Open in Browser**.

---

## Part 1 — You set up the repo (one time)

### 1. Push the project to GitHub

```bash
cd devhub-interview-kit
git push
```

Use a **private** repo if you do not want `ANSWERS_GUIDE.md` public. Give candidates read access (collaborator or org membership).

**Before pushing:** confirm `ANSWERS_GUIDE.md` is not shared with candidates (keep repo private, or remove that file from the remote).

### 2. Enable Codespaces on the repository

1. Open the repo on GitHub → **Settings**
2. **Code and automation** → **Codespaces**
3. Ensure Codespaces is allowed for the repo/org
4. (Recommended) Set default machine: **4 cores, 8 GB RAM** — matches `.devcontainer/devcontainer.json`

Org admins: **Organization settings → Codespaces** → enable for members.

### 3. Test it yourself

1. On the repo page, click **Code** → **Codespaces** → **Create codespace on main**
2. Wait ~3–8 minutes (first build pulls Postgres + Mongo images, runs `npm install`, migrates, seeds)
3. When the editor opens, check the **Ports** tab — port **5173** should appear
4. Click **Open in Browser** on port 5173
5. Log in: `engineer@devhub.local` / `devhub123`

If the app is not up yet, open a terminal in the codespace:

```bash
# See auto-start logs:
npm run codespace:logs

# Or restart manually:
npm run dev
```

You can also run these from **Terminal -> Run Task...**:

| Task                              | Use                                          |
| --------------------------------- | -------------------------------------------- |
| `DevHub: Start app`               | Start frontend and backend manually          |
| `DevHub: View auto-start logs`    | Follow `/tmp/devhub-dev.log`                 |
| `DevHub: Reset seed data`         | Re-run migrations and seed data              |
| `DevHub: Re-run Codespaces setup` | Reinstall, recreate env files, migrate, seed |

### 4. “Open in Codespaces” button

The README includes:

```markdown
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/MohamedSamirEdris/DevHub-interview-kit?quickstart=1)
```

---

## Part 2 — What to send candidates

Copy-paste:

> **DevHub interview environment (browser)**
>
> 1. Open: https://codespaces.new/MohamedSamirEdris/DevHub-interview-kit?quickstart=1
> 2. Click **Create codespace** if prompted
> 3. Wait for setup to finish (a few minutes the first time)
> 4. In the **Ports** tab, open port **5173** in your browser
> 5. Log in: `engineer@devhub.local` / `devhub123`
> 6. Read `TASKS.md` for your assigned tasks
>
> No local install required. You need a GitHub account with access to the repo.

---

## Part 3 — During the interview

| Tip              | Detail                                                                            |
| ---------------- | --------------------------------------------------------------------------------- |
| **You observe**  | Ask them to share screen, or use GitHub’s codespace sharing if your org allows it |
| **Logs**         | Terminal: `npm run codespace:logs`                                                |
| **Restart app**  | `npm run dev`                                                                     |
| **Reset data**   | `npm run codespace:reset`                                                         |
| **Stop billing** | Delete or stop codespaces when done (**github.com/codespaces**)                   |

---

## Troubleshooting

| Issue                                          | Fix                                                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Codespaces tab missing                         | Enable Codespaces in repo/org settings; you need repo access                                |
| “recovery container” / wrong stack             | Delete that codespace, ensure `main` has the latest `.devcontainer`, create a new codespace |
| Feature `postgres` permission error (old logs) | Fixed in current `main`: Postgres runs via Docker, not the GHCR devcontainer feature        |
| Setup failed in post-create                    | Open terminal → `bash .devcontainer/post-create.sh`                                         |
| Port 5173 not loading                          | Run `npm run dev`, check Ports tab visibility (Public)                                      |
| Postgres errors                                | `docker start devhub-postgres` or re-run `post-create.sh`                                   |
| Mongo errors                                   | `docker start devhub-mongo` or re-run `post-create.sh`                                      |
| Out of memory                                  | Recreate codespace with 8 GB machine                                                        |
| Slow first start                               | Normal — Postgres + Mongo image + `npm install`                                             |

---

## Billing (brief)

Codespaces usage is billed to the **repo owner** (you or your org), not the candidate, unless they use their own fork. For interviews:

- Use **private repo + collaborator access** so candidates don’t fork
- **Stop/delete** codespaces after each session
- Set org spending limits under **Settings → Billing → Codespaces**

See: https://docs.github.com/billing/managing-billing-for-github-codespaces
