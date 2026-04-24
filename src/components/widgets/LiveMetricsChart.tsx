import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const seed = Array.from({ length: 40 }, (_, i) => ({
  t: i,
  latency: 60 + Math.sin(i / 3) * 12 + Math.random() * 8,
  errors: 4 + Math.cos(i / 4) * 2 + Math.random() * 2,
  throughput: 120 + Math.sin(i / 5) * 24 + Math.random() * 8,
}));

export const LiveMetricsChart = () => {
  const [data, setData] = useState(seed);

  useEffect(() => {
    const id = setInterval(() => {
      setData((prev) => {
        const next = prev.slice(1);
        const last = prev[prev.length - 1];
        next.push({
          t: last.t + 1,
          latency: Math.max(40, Math.min(120, last.latency + (Math.random() - 0.5) * 14)),
          errors: Math.max(0, Math.min(15, last.errors + (Math.random() - 0.5) * 2)),
          throughput: Math.max(60, Math.min(200, last.throughput + (Math.random() - 0.5) * 18)),
        });
        return next;
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass relative h-full overflow-hidden rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Real-time Service Metrics</h3>
          <p className="text-xs text-muted-foreground">api-gateway · last 60s · auto-refresh</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <Legend label="Latency (ms)" color="hsl(var(--primary-glow))" />
          <Legend label="Throughput" color="hsl(var(--secondary))" />
          <Legend label="Errors" color="hsl(var(--destructive))" />
        </div>
      </div>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: -16 }}>
            <defs>
              <linearGradient id="line-latency" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(192 75% 38%)" />
                <stop offset="100%" stopColor="hsl(188 92% 60%)" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} stroke="hsl(var(--border))" />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 11,
                color: "hsl(var(--foreground))",
              }}
              cursor={{ stroke: "hsl(var(--primary-glow))", strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Line type="monotone" dataKey="latency" stroke="url(#line-latency)" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="throughput" stroke="hsl(var(--secondary))" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="errors" stroke="hsl(var(--destructive))" strokeWidth={1.5} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const Legend = ({ label, color }: { label: string; color: string }) => (
  <span className="flex items-center gap-1.5 text-muted-foreground">
    <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
    {label}
  </span>
);
