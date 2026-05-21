# GitHub Codespaces (candidate branch: `interview`)

You only need a **GitHub account and a browser**. No Docker, PostgreSQL, or MongoDB on your laptop.

---

## Quick start

Open a Codespace on the **`interview`** branch:

https://codespaces.new/MohamedSamirEdris/DevHub-interview-kit/tree/interview?quickstart=1

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

## Setup steps

1. Use the link above, or on GitHub: **Code** → **Codespaces** → branch **`interview`** → **Create codespace**
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

## During the session

| Tip              | Detail                                                                            |
| ---------------- | --------------------------------------------------------------------------------- |
| **You observe**  | Ask them to share screen, or use GitHub’s codespace sharing if your org allows it |
| **Logs**         | Terminal: `npm run codespace:logs`                                                |
| **Restart app**  | `npm run dev`                                                                     |
| **Reset data**   | `npm run codespace:reset`                                                         |
| **Stop billing** | Your interviewer stops/deletes codespaces when done                               |

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
