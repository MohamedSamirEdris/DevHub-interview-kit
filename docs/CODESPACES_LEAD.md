# Codespaces — technical lead candidates (`interview-lead` branch)

## Quick start

https://github.com/codespaces/new?hide_repo_select=true&ref=interview-lead&repo=MohamedSamirEdris/DevHub-interview-kit

1. Create the codespace (first run ~3–8 minutes).
2. Open **`TASKS_LEAD.md`**.
3. **Ports** → **5173** → open in browser.
4. Login: `engineer@devhub.local` / `devhub123`.

## Deployment practical tasks

Part B uses files in the repo:

- `docker-compose.yml`
- `docker/backend.Dockerfile`, `docker/frontend.Dockerfile`
- `docker/backend-entrypoint.sh`
- Create `.github/workflows/ci.yml` for L-D4
- Create `docs/PRODUCTION_GAPS.md` and/or `docs/DEPLOY_RUNBOOK.md` as directed

Test Docker locally in the codespace:

```bash
npm run interview
```

## Troubleshooting

| Issue               | Fix                                                       |
| ------------------- | --------------------------------------------------------- |
| 404 opening link    | Log in to GitHub; accept collaborator invite              |
| App not running     | `npm run dev` or `npm run codespace:logs`                 |
| Docker in Codespace | DinD is enabled in `.devcontainer` — wait for post-create |
