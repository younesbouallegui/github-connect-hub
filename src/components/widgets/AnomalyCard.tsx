import { Brain, TrendingUp } from "lucide-react";

interface AnomalyCardProps {
  service: string;
  description: string;
  confidence: number;
  severity: "low" | "med" | "high";
}

export const AnomalyCard = ({ service, description, confidence, severity }: AnomalyCardProps) => {
  const sevColor =
    severity === "high" ? "destructive" : severity === "med" ? "warning" : "success";
  return (
    <div className="glass group relative overflow-hidden rounded-xl p-4 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-glow/40 to-transparent" />
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
          <Brain className="h-4 w-4 text-primary-glow" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{service}</p>
            <span
              className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                sevColor === "destructive"
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : sevColor === "warning"
                  ? "border-warning/30 bg-warning/10 text-warning"
                  : "border-success/30 bg-success/10 text-success"
              }`}
            >
              {severity}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{description}</p>

          <div className="mt-3 flex items-center gap-2">
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow shadow-[0_0_8px_hsl(var(--primary-glow))]"
                style={{ width: `${confidence}%`, transition: "width 1s cubic-bezier(0.16,1,0.3,1)" }}
              />
            </div>
            <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-primary-glow tabular-nums">
              <TrendingUp className="h-3 w-3" />
              {confidence}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
