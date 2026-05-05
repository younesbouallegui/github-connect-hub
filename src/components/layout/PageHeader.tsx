import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** Singular alias for `actions` for newer pages. */
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  actions,
  action,
  icon: Icon,
  className,
}: PageHeaderProps) => {
  const right = actions ?? action;
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-6",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 sm:inline-flex">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
};
