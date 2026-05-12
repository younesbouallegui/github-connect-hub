import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Activity, AlertTriangle, ArrowUpRight, Boxes, ShieldCheck, Timer } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useI18n } from "@/contexts/I18nContext";
import { severityTier, useZabbixHosts, useZabbixProblems, useZabbixServices } from "@/lib/zabbix";
import { cn } from "@/lib/utils";

const SEV: Array<"critical" | "high" | "medium" | "low"> = ["critical", "high", "medium", "low"];

export default function Executive() {
  const { t } = useI18n();
  const { data: hosts = [] } = useZabbixHosts();
  const { data: problems = [] } = useZabbixProblems();
  const { data: services = [] } = useZabbixServices();

  const sev = useMemo(() => {
    const acc = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const p of problems) acc[severityTier(p.severity) as keyof typeof acc]++;
    return acc;
  }, [problems]);

  const risk = Math.min(100, sev.critical * 20 + sev.high * 10 + sev.medium * 3);
  const health = Math.max(0, 100 - risk);
  const okServices = services.filter((s) => s.status === "0" || s.status === "-1").length;
  const sla = services.length ? (okServices / services.length) * 100 : 100;
  const now = Math.floor(Date.now() / 1000);
  const mttd = problems.length
    ? Math.round(problems.reduce((s, p) => s + (now - parseInt(p.clock, 10)), 0) / problems.length / 60)
    : 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={t("exec.title")}
        subtitle={t("exec.subtitle")}
        actions={
          <Link to="/alerts" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
            {t("exec.viewAlerts")} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      />
      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-4">
        <Kpi icon={ShieldCheck} label="Health" value={`${health}`} hint="/100" />
        <Kpi icon={Boxes} label={t("exec.assets")} value={String(hosts.length)} />
        <Kpi icon={AlertTriangle} label={t("exec.activeAlerts")} value={String(problems.length)} />
        <Kpi icon={Activity} label="SLA OK" value={`${sla.toFixed(1)}%`} />
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Severity breakdown</p>
          <div className="space-y-3">
            {SEV.map((s) => {
              const total = problems.length || 1;
              const pct = (sev[s] / total) * 100;
              return (
                <div key={s}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="capitalize">{s}</span>
                    <span className="font-mono text-muted-foreground">{sev[s]}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full",
                        s === "critical" || s === "high" ? "bg-destructive" : s === "medium" ? "bg-warning" : "bg-primary")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Operational metrics</p>
          <div className="grid grid-cols-2 gap-4">
            <Stat icon={Timer} label="Avg incident age" value={`${mttd}m`} />
            <Stat icon={Activity} label="Risk score" value={`${risk}/100`} />
            <Stat icon={Boxes} label="Services" value={String(services.length)} />
            <Stat icon={ShieldCheck} label="Healthy services" value={String(okServices)} />
          </div>
        </div>
      </div>
    </div>
  );
}

const Kpi = ({ icon: Icon, label, value, hint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; hint?: string }) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/60"><Icon className="h-5 w-5" /></div>
    <p className="mt-4 text-2xl font-semibold tracking-tight">{value}{hint && <span className="ml-1 text-xs text-muted-foreground">{hint}</span>}</p>
    <p className="mt-1 text-xs text-muted-foreground">{label}</p>
  </div>
);

const Stat = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <Icon className="mt-1 h-4 w-4 text-muted-foreground" />
    <div>
      <p className="font-mono text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  </div>
);
