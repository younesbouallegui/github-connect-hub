import { useEffect, useState } from "react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { CursorGlow } from "@/components/CursorGlow";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MetricCard } from "@/components/widgets/MetricCard";
import { LiveMetricsChart } from "@/components/widgets/LiveMetricsChart";
import { SLAGauge } from "@/components/widgets/SLAGauge";
import { IncidentTimeline } from "@/components/widgets/IncidentTimeline";
import { AnomalyCard } from "@/components/widgets/AnomalyCard";
import { LogsViewer } from "@/components/widgets/LogsViewer";
import { ChatOpsPanel } from "@/components/widgets/ChatOpsPanel";

const sparkline = (n: number, base: number, amp: number) =>
  Array.from({ length: n }, (_, i) => base + Math.sin(i / 2.5) * amp + Math.random() * (amp / 2));

const Index = () => {
  const [active, setActive] = useState("dashboard");
  const [notice, setNotice] = useState<string | null>(null);

  // Demo: fire a slide-in notification once on mount
  useEffect(() => {
    const t = setTimeout(() => {
      setNotice("AI auto-resolved INC-2401 · payment-svc latency normalized");
      setTimeout(() => setNotice(null), 6000);
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      <AnimatedBackground />
      <CursorGlow />

      <Sidebar active={active} onSelect={setActive} />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Hero / page title */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 animate-fade-up">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-glow">
                Mission Control
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gradient md:text-3xl">
                Production · Global Overview
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                12 clusters · 248 services · AI co-pilot active across 3 regions
              </p>
            </div>
            <div className="flex items-center gap-2">
              {["1h", "6h", "24h", "7d"].map((r, i) => (
                <button
                  key={r}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                    i === 1
                      ? "border-primary/40 bg-primary/10 text-primary-glow shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]"
                      : "border-border/60 bg-background-elevated/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="CPU Avg" value="42.3" unit="%" delta={2.4} icon="cpu" data={sparkline(24, 40, 8)} />
            <MetricCard label="Memory" value="61.8" unit="%" delta={-1.1} icon="memory" data={sparkline(24, 60, 6)} tone="warning" />
            <MetricCard label="Throughput" value="1.24M" unit="req/m" delta={8.2} icon="network" data={sparkline(24, 120, 18)} tone="success" />
            <MetricCard label="MTTR" value="9m 12s" delta={-34.6} icon="activity" data={sparkline(24, 14, 4)} tone="success" />
          </div>

          {/* Main grid: chart + chatops */}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="space-y-4 xl:col-span-2">
              <LiveMetricsChart />
              <IncidentTimeline />

              {/* SLA + anomalies row */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="glass rounded-xl p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">SLA Compliance</h3>
                      <p className="text-xs text-muted-foreground">rolling 30 days</p>
                    </div>
                    <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-success">
                      All on track
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <SLAGauge label="API Uptime" value={99.98} target={99.95} />
                    <SLAGauge label="Payments" value={99.92} target={99.9} />
                    <SLAGauge label="Auth" value={99.87} target={99.9} />
                  </div>
                </div>

                <div className="glass rounded-xl p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">AI Anomaly Detection</h3>
                      <p className="text-xs text-muted-foreground">last 60 minutes</p>
                    </div>
                    <span className="font-mono text-[10px] text-primary-glow">3 active</span>
                  </div>
                  <div className="space-y-2.5">
                    <AnomalyCard
                      service="checkout-api"
                      description="Latency p99 drift +18% above baseline · pattern matches noisy-neighbor signature"
                      confidence={94}
                      severity="high"
                    />
                    <AnomalyCard
                      service="search-index"
                      description="Memory growth slope unusual — possible leak in tokenizer cache"
                      confidence={78}
                      severity="med"
                    />
                  </div>
                </div>
              </div>

              <LogsViewer />
            </div>

            {/* ChatOps panel */}
            <div className="xl:col-span-1">
              <div className="sticky top-[88px] h-[calc(100vh-110px)]">
                <ChatOpsPanel />
              </div>
            </div>
          </div>

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-4 text-[11px] text-muted-foreground">
            <span>Nexus AIOps · Enterprise ChatOps Control Center</span>
            <span className="font-mono">build 2.4.1 · region eu-west-1 · audit trail · zero-trust</span>
          </footer>
        </main>
      </div>

      {/* Slide-in notification */}
      {notice && (
        <div className="fixed right-6 top-20 z-50 max-w-sm animate-slide-in-right">
          <div className="glass-strong flex items-start gap-3 rounded-xl p-4 shadow-elevated">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/15 ring-1 ring-success/30">
              <span className="h-2 w-2 animate-pulse-soft rounded-full bg-success" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-success">Auto-Resolved</p>
              <p className="mt-0.5 text-sm text-foreground">{notice}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
