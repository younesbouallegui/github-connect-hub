interface SLAGaugeProps {
  label: string;
  value: number; // 0-100
  target: number;
}

export const SLAGauge = ({ label, value, target }: SLAGaugeProps) => {
  const radius = 38;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const ok = value >= target;
  const color = ok ? "hsl(var(--success))" : value > target - 1 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} stroke="hsl(var(--border))" strokeWidth="6" fill="none" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)",
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-semibold text-foreground tabular-nums">{value.toFixed(2)}</span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-semibold text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">target {target}%</p>
      </div>
    </div>
  );
};
