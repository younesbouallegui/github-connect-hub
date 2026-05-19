import { cn } from "@/lib/utils";
import type { AppStatus } from "@/types/applications";

const STATUS_META: Record<AppStatus, { label: string; cls: string; dot: string }> = {
  healthy:   { label: "Healthy",   cls: "bg-success/10 text-success ring-success/30",            dot: "bg-success" },
  warning:   { label: "Warning",   cls: "bg-warning/10 text-warning ring-warning/30",            dot: "bg-warning" },
  degraded:  { label: "Degraded",  cls: "bg-orange-500/10 text-orange-600 ring-orange-500/30",   dot: "bg-orange-500" },
  critical:  { label: "Critical",  cls: "bg-destructive/10 text-destructive ring-destructive/40",dot: "bg-destructive" },
  unknown:   { label: "Unknown",   cls: "bg-muted text-muted-foreground ring-border",            dot: "bg-muted-foreground" },
};

export function AppStatusBadge({ status, withDot = true, className }: { status: AppStatus; withDot?: boolean; className?: string }) {
  const m = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1", m.cls, className)}>
      {withDot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", m.dot)} />
          <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", m.dot)} />
        </span>
      )}
      {m.label}
    </span>
  );
}

export function HealthBar({ value, className }: { value: number; className?: string }) {
  const color = value >= 90 ? "bg-success" : value >= 75 ? "bg-warning" : value >= 60 ? "bg-orange-500" : "bg-destructive";
  return (
    <div className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
