# Poulina AI Hub

**Enterprise Operational OS** — unified observability, dashboards, CMDB and governance for the Poulina Group.

## Features

- **Dashboards** — One unified Grafana-class dashboard module: Executive, NOC, Department, Team and Personal categories, plus templates and a fullscreen wallboard mode.
- **Panel builder** — Host-first creation flow: scope → metric → visualization → configure (with thresholds, severity colors, multi-host compare, forecast).
- **Monitoring data model** — Providers, host groups, hosts, metrics, alerts, dashboards and panels.
- **Governance** — Users, departments, audit log, RBAC and integration center.
- **Internationalization** — English / French.

## Local development

```bash
bun install
bun run dev
```

The app runs at `http://localhost:8080`.

## Environment variables

Public (browser):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Server-only secrets (never prefixed with `VITE_`):
- `SUPABASE_SERVICE_ROLE_KEY`

## Deployment (GitHub Actions)

A production-ready pipeline is defined in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. **quality** — install, lint, type-check, run tests.
2. **build** — produce a `dist/` artifact.
3. **security** — run dependency audit.
4. **deploy** — placeholder step; wire it to your target (Vercel, Netlify, S3+CloudFront, Nginx, …).

### Required GitHub Secrets

| Secret | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Public Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public Supabase key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |
| `DEPLOY_TOKEN` | Token for your hosting provider |

Add these in **Settings → Secrets and variables → Actions** on the GitHub repository.

The pipeline runs on every push to `main` and on pull requests, but only **deploys** on `main` pushes.

## License

© Poulina Group — All rights reserved.
