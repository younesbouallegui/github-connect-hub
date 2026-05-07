import { useState, useRef } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Plus,
  LineChart as LineIcon,
  BarChart3,
  PieChart as PieIcon,
  Gauge,
  Activity,
  Table as TableIcon,
  Trash2,
  Save,
  Tv,
  Download,
  Upload,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { cn } from "@/lib/utils";

type WidgetKind = "line" | "area" | "bar" | "pie" | "gauge" | "stat" | "table";

interface Widget {
  id: string;
  kind: WidgetKind;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const sampleSeries = Array.from({ length: 24 }, (_, i) => ({
  t: `${i}:00`,
  v: Math.round(40 + Math.sin(i / 3) * 20 + Math.random() * 10),
  v2: Math.round(60 + Math.cos(i / 4) * 15 + Math.random() * 8),
}));
const samplePie = [
  { name: "Critical", value: 4, color: "hsl(var(--destructive))" },
  { name: "Warning", value: 9, color: "hsl(var(--warning, 38 92% 50%))" },
  { name: "Info", value: 21, color: "hsl(var(--primary))" },
];

const PALETTE: { kind: WidgetKind; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { kind: "line", label: "Line", icon: LineIcon },
  { kind: "area", label: "Area", icon: Activity },
  { kind: "bar", label: "Bar", icon: BarChart3 },
  { kind: "pie", label: "Pie", icon: PieIcon },
  { kind: "gauge", label: "Gauge", icon: Gauge },
  { kind: "stat", label: "Stat", icon: Activity },
  { kind: "table", label: "Table", icon: TableIcon },
];

const GRID = 40;

const Dashboards = () => {
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: "w1", kind: "line", title: "CPU usage (%)", x: 0, y: 0, w: 8, h: 5 },
    { id: "w2", kind: "stat", title: "Active alerts", x: 8, y: 0, w: 4, h: 2 },
    { id: "w3", kind: "pie", title: "Alerts by severity", x: 8, y: 2, w: 4, h: 3 },
    { id: "w4", kind: "bar", title: "Throughput / host", x: 0, y: 5, w: 6, h: 4 },
    { id: "w5", kind: "area", title: "Network in/out", x: 6, y: 5, w: 6, h: 4 },
  ]);
  const [tv, setTv] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; offX: number; offY: number; mode: "move" | "resize" } | null>(null);

  const addWidget = (kind: WidgetKind) => {
    setWidgets((w) => [
      ...w,
      { id: crypto.randomUUID(), kind, title: `New ${kind}`, x: 0, y: 0, w: 4, h: 3 },
    ]);
  };
  const remove = (id: string) => setWidgets((w) => w.filter((x) => x.id !== id));

  const onPointerDown = (e: React.PointerEvent, w: Widget, mode: "move" | "resize") => {
    const rect = canvasRef.current!.getBoundingClientRect();
    drag.current = {
      id: w.id,
      offX: e.clientX - rect.left - w.x * GRID,
      offY: e.clientY - rect.top - w.y * GRID,
      mode,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setWidgets((ws) =>
      ws.map((w) => {
        if (w.id !== drag.current!.id) return w;
        if (drag.current!.mode === "move") {
          const nx = Math.max(0, Math.round((px - drag.current!.offX) / GRID));
          const ny = Math.max(0, Math.round((py - drag.current!.offY) / GRID));
          return { ...w, x: nx, y: ny };
        }
        const nw = Math.max(2, Math.round((px - w.x * GRID) / GRID));
        const nh = Math.max(2, Math.round((py - w.y * GRID) / GRID));
        return { ...w, w: nw, h: nh };
      })
    );
  };
  const onPointerUp = () => (drag.current = null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(widgets, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "dashboard.json";
    a.click();
  };
  const importJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        setWidgets(JSON.parse(r.result as string));
      } catch {}
    };
    r.readAsText(f);
  };

  return (
    <div className={cn("flex min-h-full flex-col", tv && "bg-background")}>
      {!tv && (
        <PageHeader
          title="Dashboards"
          subtitle="Drag-and-drop visual builder · Grafana-class panels"
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setTv(true)}>
                <Tv className="mr-2 h-4 w-4" /> TV mode
              </Button>
              <Button variant="outline" size="sm" onClick={exportJson}>
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
              <label className="inline-flex cursor-pointer items-center rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-muted">
                <Upload className="mr-2 h-4 w-4" /> Import
                <input type="file" accept="application/json" hidden onChange={importJson} />
              </label>
              <Button size="sm">
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </div>
          }
        />
      )}
      <div className="flex flex-1 gap-4 p-4">
        {!tv && (
          <Card className="h-fit w-44 shrink-0 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Widgets
            </p>
            <div className="grid gap-1.5">
              {PALETTE.map((p) => (
                <button
                  key={p.kind}
                  onClick={() => addWidget(p.kind)}
                  className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  <p.icon className="h-4 w-4 text-primary" />
                  {p.label}
                  <Plus className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </Card>
        )}
        <div
          ref={canvasRef}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="relative flex-1 overflow-auto rounded-lg border border-dashed border-border bg-muted/20"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--border)/.4) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)/.4) 1px, transparent 1px)",
            backgroundSize: `${GRID}px ${GRID}px`,
            minHeight: 800,
          }}
        >
          {widgets.map((w) => (
            <div
              key={w.id}
              className="absolute rounded-lg border border-border bg-card shadow-sm"
              style={{
                left: w.x * GRID,
                top: w.y * GRID,
                width: w.w * GRID,
                height: w.h * GRID,
              }}
            >
              <div
                onPointerDown={(e) => onPointerDown(e, w, "move")}
                className="flex cursor-move items-center justify-between border-b border-border px-3 py-1.5"
              >
                <span className="truncate text-xs font-semibold text-foreground">{w.title}</span>
                {!tv && (
                  <button onClick={() => remove(w.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="h-[calc(100%-32px)] p-2">
                <WidgetBody kind={w.kind} />
              </div>
              {!tv && (
                <div
                  onPointerDown={(e) => onPointerDown(e, w, "resize")}
                  className="absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize rounded-tl-md bg-primary/40"
                />
              )}
            </div>
          ))}
        </div>
      </div>
      {tv && (
        <Button onClick={() => setTv(false)} className="fixed right-4 top-4 z-50" size="sm" variant="outline">
          Exit TV mode
        </Button>
      )}
    </div>
  );
};

const WidgetBody = ({ kind }: { kind: WidgetKind }) => {
  if (kind === "stat")
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-3xl font-bold text-foreground">42</p>
        <p className="text-xs text-muted-foreground">↑ 12% vs yesterday</p>
      </div>
    );
  if (kind === "gauge")
    return (
      <div className="flex h-full items-center justify-center">
        <div className="relative h-full max-h-32 w-full max-w-32">
          <svg viewBox="0 0 100 60" className="h-full w-full">
            <path d="M10,55 A40,40 0 0 1 90,55" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
            <path d="M10,55 A40,40 0 0 1 78,28" stroke="hsl(var(--primary))" strokeWidth="8" fill="none" />
          </svg>
          <p className="absolute inset-x-0 bottom-1 text-center text-xl font-bold">87%</p>
        </div>
      </div>
    );
  if (kind === "table")
    return (
      <div className="h-full overflow-auto text-xs">
        <table className="w-full">
          <thead className="text-muted-foreground">
            <tr><th className="text-left">Host</th><th className="text-right">CPU</th><th className="text-right">Mem</th></tr>
          </thead>
          <tbody>
            {["web-01","db-02","app-03","cache-04"].map((h,i) => (
              <tr key={h} className="border-t border-border"><td>{h}</td><td className="text-right">{40+i*8}%</td><td className="text-right">{55+i*5}%</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  return (
    <ResponsiveContainer width="100%" height="100%">
      {kind === "line" ? (
        <LineChart data={sampleSeries}>
          <XAxis dataKey="t" hide /><YAxis hide /><Tooltip />
          <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="v2" stroke="hsl(var(--success, 142 71% 45%))" strokeWidth={2} dot={false} />
        </LineChart>
      ) : kind === "area" ? (
        <AreaChart data={sampleSeries}>
          <XAxis dataKey="t" hide /><YAxis hide /><Tooltip />
          <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/.25)" />
        </AreaChart>
      ) : kind === "bar" ? (
        <BarChart data={sampleSeries.slice(0, 8)}>
          <XAxis dataKey="t" hide /><YAxis hide /><Tooltip />
          <Bar dataKey="v" fill="hsl(var(--primary))" />
        </BarChart>
      ) : (
        <PieChart>
          <Pie data={samplePie} dataKey="value" nameKey="name" innerRadius={30} outerRadius={55}>
            {samplePie.map((s) => <Cell key={s.name} fill={s.color} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      )}
    </ResponsiveContainer>
  );
};

export default Dashboards;
