This is a large, multi-track rebuild. I'll execute it in clearly scoped phases so each piece lands at production quality instead of partially shipping all of it. Please confirm the order/scope before I start coding.

## Phase 1 — Branding sweep (Poulina AI Hub)
- Replace `index.html` `<title>`, meta description, OG/Twitter tags, theme-color → "Poulina AI Hub"
- Replace `/favicon.ico` and `/public/placeholder.svg` references; generate a Poulina logo asset (SVG) and use it for:
  - favicon (multiple sizes via link tags)
  - sidebar logo (`Sidebar.tsx`)
  - login screen (`pages/Login.tsx`)
  - top bar (if logo present)
- Add `public/manifest.webmanifest` with name "Poulina AI Hub", short_name, icons
- Search the codebase for "lovable", "Lovable", "lov-" strings in user-visible text and replace
- README header rebrand

## Phase 2 — Dashboard architecture consolidation
- Remove `pages/Dashboard.tsx` and `pages/Executive.tsx` as standalone routes
- Keep ONE module: `/dashboards` with nested routes:
  - `/dashboards` — Home (list + recents + favorites)
  - `/dashboards/builder/:id?` — Grafana-style builder
  - `/dashboards/templates` — Template gallery
  - `/dashboards/view/:id` — Read-only viewer
  - `/dashboards/wallboard/:id` — Fullscreen NOC wallboard
  - Built-in categories (filters, not separate routes): Executive, NOC, Department, Personal, Team
- Update `Sidebar.tsx`: remove "Dashboard" + "Executive" entries, single "Dashboards" entry
- Update default redirect from `/` to `/dashboards`
- Migrate any unique widgets from old Dashboard/Executive into template presets

## Phase 3 — Grafana-class panel builder
- New panel-add wizard with 4 steps (modal/drawer):
  1. **Scope**: Host / Host Group / Department / Asset / Business Service / Provider (searchable picker)
  2. **Metric**: CPU, RAM, Disk, Network, Packet Loss, Ping, Availability, Uptime, Error Rate, Temperature, Triggers, Alerts, SLA, Capacity
  3. **Visualization**: Line, Area, Stacked, Bar, Pie, Donut, Gauge, Heatmap, SLA Meter, Status Card, Table, Topology, Alert Stream, Timeline
  4. **Configure**: Time range, thresholds, severity colors, refresh interval, scope filters, multi-host compare, forecast toggle
- Freeform grid (`react-grid-layout`): drag, resize, snap, duplicate, clone, save-as-template, edit query, collapse/expand
- Premium chart styling using Recharts with custom theme: threshold bands, severity colors from design tokens, dense gridlines, proper axes, legends
- Per-panel state persisted (Cloud-backed once tables exist; localStorage fallback meanwhile)

## Phase 4 — Monitoring data model (Lovable Cloud)
Tables (with RLS):
- `monitoring_providers` (zabbix, prometheus, datadog, etc.)
- `monitoring_host_groups`
- `monitoring_hosts` (FK group, FK provider, department, tags)
- `monitoring_metrics` (FK host, type, unit, last_value, ts)
- `monitoring_alerts` (FK host/metric, severity, status, ts)
- `monitoring_dashboards` (owner, scope, category, layout JSON)
- `dashboard_panels` (FK dashboard, type, title, grid pos, config JSON)
- `panel_queries` (FK panel, scope, metric, filters, agg, range)
- `monitoring_sync_logs` (provider, status, ts, payload)
- Seed sample data so visuals are not empty

## Phase 5 — GitHub Actions CI/CD
- `.github/workflows/deploy.yml` with jobs:
  - install → lint → typecheck → test → build → upload artifact → deploy stage (placeholder)
- Secret placeholders: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, deploy tokens
- README "Deployment" section with setup steps

## Technical notes
- Stack stays as-is (React + Vite + React Router + shadcn). Adds: `react-grid-layout`, optional `@tanstack/react-table` if not present.
- Charts continue using Recharts; styling upgrade only.
- All colors via design tokens in `src/styles.css` (severity scale: ok/info/warn/error/critical).
- Lovable Cloud is already enabled (Supabase client present) — I'll add migrations.

## Estimated scope
This is roughly 40–60 file changes plus DB migrations. Recommended order: **Phase 1 → 2 → 3 → 4 → 5**, shipping each phase as a working state.

## Question before I start
Do you want me to:
- **(A) Execute all 5 phases now in one go** (long single response, higher risk of incomplete bits), or
- **(B) Ship phase-by-phase** so you can validate each (recommended), or
- **(C) Start with Phase 1 + 2 (branding + dashboard merge) right now**, then continue?

Reply A / B / C and I'll proceed.