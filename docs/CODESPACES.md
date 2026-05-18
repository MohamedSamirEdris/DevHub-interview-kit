# GitHub Codespaces setup (interviewers)

Candidates only need a **GitHub account and a browser**. No Docker, PostgreSQL, or MongoDB on their laptop.

---

## Part 1 — You set up the repo (one time)

### 1. Push the project to GitHub

```bash
cd devhub-interview-kit
git init
git add .
git commit -m "Add DevHub interview kit"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/devhub-interview-kit.git
git push -u origin main
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
2. Wait ~3–8 minutes (first build installs Postgres, Mongo image, npm, seed data)
3. When the editor opens, check the **Ports** tab — port **5173** should appear
4. Click **Open in Browser** on port 5173
5. Log in: `engineer@devhub.local` / `devhub123`

If the app is not up yet, open a terminal in the codespace:

```bash
tail -f /tmp/devhub-dev.log
# or restart:
npm run dev
```

### 4. Add an “Open in Codespaces” button (optional)

In `README.md`, replace `YOUR_ORG` and `YOUR_REPO`:

```markdown
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/YOUR_ORG/YOUR_REPO?quickstart=1)
```

---

## Part 2 — What to send candidates

Copy-paste:

> **DevHub interview environment (browser)**  
> 1. Open: https://github.com/YOUR_ORG/YOUR_REPO  
> 2. Click **Code** → **Codespaces** → **Create codespace on main**  
> 3. Wait for setup to finish (a few minutes the first time)  
> 4. In the **Ports** tab, open port **5173** in your browser  
> 5. Log in: `engineer@devhub.local` / `devhub123`  
> 6. Read `TASKS.md` for your assigned tasks  
>
> No local install required. You need a GitHub account with access to the repo.

---

## Part 3 — During the interview

| Tip | Detail |
|-----|--------|
| **You observe** | Ask them to share screen, or use GitHub’s codespace sharing if your org allows it |
| **Logs** | Terminal: `tail -f /tmp/devhub-dev.log` |
| **Restart app** | `npm run dev` |
| **Reset data** | `npm run db:migrate && npm run seed` |
| **Stop billing** | Delete or stop codespaces when done (**github.com/codespaces**) |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Codespaces tab missing | Enable Codespaces in repo/org settings; you need repo access |
| Setup failed in post-create | Open terminal → `bash .devcontainer/post-create.sh` |
| Port 5173 not loading | Run `npm run dev`, check Ports tab visibility (Public) |
| Mongo errors | `docker start devhub-mongo` or re-run `post-create.sh` |
| Out of memory | Recreate codespace with 8 GB machine |
| Slow first start | Normal — Postgres + Mongo image + `npm install` |

---

## Billing (brief)

Codespaces usage is billed to the **repo owner** (you or your org), not the candidate, unless they use their own fork. For interviews:

- Use **private repo + collaborator access** so candidates don’t fork
- **Stop/delete** codespaces after each session
- Set org spending limits under **Settings → Billing → Codespaces**

See: https://docs.github.com/billing/managing-billing-for-github-codespaces
