const logs = [
  { lvl: "INFO", svc: "api-gateway", msg: "Request handled in 42ms · GET /v2/users/9182" },
  { lvl: "WARN", svc: "payment-svc", msg: "Retry attempt 2/3 · upstream timeout 1.2s" },
  { lvl: "ERROR", svc: "payment-svc", msg: "Connection refused · stripe-webhook.eu-west-1" },
  { lvl: "AI", svc: "nexus-ai", msg: "Anomaly cluster detected · correlation 0.94 with INC-2401" },
  { lvl: "INFO", svc: "k8s-controller", msg: "Pod payment-svc-7d4 evicted · scheduling replacement" },
  { lvl: "INFO", svc: "k8s-controller", msg: "Pod payment-svc-9a2 ready · 2/2 containers" },
  { lvl: "AI", svc: "nexus-ai", msg: "Auto-remediation succeeded · confidence 96.4%" },
  { lvl: "INFO", svc: "api-gateway", msg: "Latency p99 normalized · 62ms (-58%)" },
];

const colorFor = (lvl: string) => {
  if (lvl === "ERROR") return "text-destructive";
  if (lvl === "WARN") return "text-warning";
  if (lvl === "AI") return "text-primary-glow";
  return "text-muted-foreground";
};

export const LogsViewer = () => (
  <div className="glass relative h-full overflow-hidden rounded-xl">
    <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Live Logs · production</h3>
        <p className="text-xs text-muted-foreground">smart-highlight · 12.4k/s</p>
      </div>
      <span className="flex items-center gap-1.5 text-[10px] text-success">
        <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success" />
        STREAMING
      </span>
    </div>
    <div className="max-h-[260px] space-y-0.5 overflow-y-auto p-2 font-mono text-[11px] leading-relaxed">
      {logs.map((l, i) => (
        <div
          key={i}
          className="group flex items-start gap-3 rounded-md px-2 py-1 transition-colors hover:bg-background-elevated/60"
          style={{ animation: `fade-up 400ms ${i * 60}ms both var(--ease-out-expo)` }}
        >
          <span className="text-muted-foreground/50">{String(i + 1).padStart(2, "0")}</span>
          <span className={`w-12 shrink-0 font-bold ${colorFor(l.lvl)}`}>{l.lvl}</span>
          <span className="w-32 shrink-0 truncate text-secondary">{l.svc}</span>
          <span className="text-foreground/80">{l.msg}</span>
        </div>
      ))}
    </div>
  </div>
);
