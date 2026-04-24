import { AlertTriangle, CheckCircle2, Clock, Zap } from "lucide-react";

const events = [
  { id: 1, time: "14:02", title: "Anomaly detected · payment-svc", type: "warn" as const, ai: true },
  { id: 2, time: "14:05", title: "AI auto-remediation started", type: "ai" as const, ai: true },
  { id: 3, time: "14:07", title: "Pod restart · payment-svc-7d4", type: "info" as const, ai: false },
  { id: 4, time: "14:09", title: "Latency normalized · 62ms", type: "ok" as const, ai: false },
  { id: 5, time: "14:11", title: "Post-mortem draft generated", type: "ai" as const, ai: true },
];

const iconFor = (t: string) => {
  if (t === "warn") return AlertTriangle;
  if (t === "ai") return Zap;
  if (t === "ok") return CheckCircle2;
  return Clock;
};

const colorFor = (t: string) => {
  if (t === "warn") return "hsl(var(--warning))";
  if (t === "ai") return "hsl(var(--primary-glow))";
  if (t === "ok") return "hsl(var(--success))";
  return "hsl(var(--info))";
};

export const IncidentTimeline = () => (
  <div className="glass relative overflow-hidden rounded-xl p-5">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Incident Timeline · INC-2401</h3>
        <p className="text-xs text-muted-foreground">payment-svc · resolved by AI in 9m 12s</p>
      </div>
      <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-success">
        Resolved
      </span>
    </div>

    <div className="relative mt-6 overflow-x-auto">
      <div className="absolute left-0 right-0 top-[26px] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="flex min-w-max gap-10 px-2">
        {events.map((e) => {
          const Icon = iconFor(e.type);
          const color = colorFor(e.type);
          return (
            <div key={e.id} className="relative flex flex-col items-start">
              <div
                className="relative z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full border border-border bg-background-elevated transition-all duration-300 hover:scale-110"
                style={{ boxShadow: `0 0 0 1px ${color}40, 0 0 16px ${color}40` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
                {e.ai && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-primary-glow px-1 py-0.5 text-[8px] font-bold text-background">
                    AI
                  </span>
                )}
              </div>
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">{e.time}</p>
              <p className="mt-0.5 max-w-[160px] text-[11px] font-medium leading-snug text-foreground">{e.title}</p>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
