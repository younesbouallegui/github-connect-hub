import { Link } from "react-router-dom";
import { Activity, ArrowUpRight, ShieldCheck } from "lucide-react";
import { useApplications } from "@/hooks/useApplications";
import { HealthBar } from "@/components/applications/AppStatusBadge";
import { cn } from "@/lib/utils";

export function AppOpsCenter() {
  const { data: apps = [] } = useApplications();
  if (!apps.length) return null;
  const counts = { healthy: 0, warning: 0, degraded: 0, critical: 0, unknown: 0 };
  let slaSum = 0, riskSum = 0;
  apps.forEach((a) => { counts[a.status]++; slaSum += a.slaActual; riskSum += a.riskScore; });
  const t0 = apps.filter((a) => a.criticality === "T0");
  const avgSla = slaSum / apps.length;
  const avgRisk = riskSum / apps.length;
  const topRisk = [...apps].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  const regions = Array.from(new Set(apps.map((a) => a.region)));

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Application Operations Center</h3>
          <p className="text-[11px] text-muted-foreground">{apps.length} apps · {t0.length} business-critical (T0) · live</p>
        </div>
        <Link to="/applications" className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
          Open command <ArrowUpRight className="h-3 w-3" />
        </Link>
      </header>

      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Tile label="Total" value={apps.length} icon={Activity} />
        <Tile label="Healthy" value={counts.healthy} tone="success" />
        <Tile label="Warning" value={counts.warning} tone="warning" />
        <Tile label="Degraded" value={counts.degraded} tone="orange" />
        <Tile label="Critical" value={counts.critical} tone="critical" />
        <Tile label="Avg SLA" value={`${avgSla.toFixed(2)}%`} icon={ShieldCheck} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Top risk apps · avg risk {avgRisk.toFixed(0)}</h4>
          <ul className="space-y-1.5">
            {topRisk.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-1.5 text-sm">
                <Link to={`/applications/${a.id}`} className="hover:text-primary">{a.name}</Link>
                <div className="flex w-32 items-center gap-2">
                  <HealthBar value={100 - a.riskScore} />
                  <span className="w-7 text-right font-mono text-[10px]">{a.riskScore}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Region health</h4>
          <div className="space-y-1.5">
            {regions.map((r) => {
              const rApps = apps.filter((a) => a.region === r);
              const avg = rApps.reduce((s, a) => s + a.healthScore, 0) / rApps.length;
              return (
                <div key={r} className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-1.5 text-sm">
                  <span className="w-20">{r}</span>
                  <HealthBar value={avg} />
                  <span className="w-10 text-right font-mono text-[10px]">{avg.toFixed(0)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({ label, value, hint, icon: Icon, tone }: { label: string; value: React.ReactNode; hint?: string; icon?: React.ComponentType<{ className?: string }>; tone?: "success"|"warning"|"orange"|"critical" }) {
  const t = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "orange" ? "text-orange-500" : tone === "critical" ? "text-destructive" : "";
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <div className={cn("mt-1 text-xl font-bold tabular-nums", t)}>{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
