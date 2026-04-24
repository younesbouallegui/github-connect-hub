import { Activity, ArrowDownRight, ArrowUpRight, Cpu, MemoryStick, Network } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  delta: number;
  icon: "cpu" | "memory" | "network" | "activity";
  data: number[];
  tone?: "primary" | "success" | "warning";
}

const iconMap = { cpu: Cpu, memory: MemoryStick, network: Network, activity: Activity };

export const MetricCard = ({ label, value, unit, delta, icon, data, tone = "primary" }: MetricCardProps) => {
  const Icon = iconMap[icon];
  const positive = delta >= 0;
  const chartData = data.map((v, i) => ({ x: i, y: v }));
  const colorVar =
    tone === "success" ? "var(--success)" : tone === "warning" ? "var(--warning)" : "var(--primary-glow)";

  return (
    <div className="glass group relative overflow-hidden rounded-xl p-5 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-elevated">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: `radial-gradient(circle, hsl(${colorVar} / 0.4), transparent 70%)` }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon className="h-3.5 w-3.5" style={{ color: `hsl(${colorVar})` }} />
            <span className="text-[11px] font-medium uppercase tracking-[0.12em]">{label}</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-semibold text-foreground tabular-nums">{value}</span>
            {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
          </div>
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
            positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          }`}
        >
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(delta).toFixed(1)}%
        </div>
      </div>

      <div className="relative mt-3 h-12 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
            <defs>
              <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={`hsl(${colorVar})`} stopOpacity={0.4} />
                <stop offset="100%" stopColor={`hsl(${colorVar})`} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="y"
              stroke={`hsl(${colorVar})`}
              strokeWidth={1.5}
              fill={`url(#grad-${label})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
