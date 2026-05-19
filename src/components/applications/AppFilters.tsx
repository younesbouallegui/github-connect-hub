import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { Application, AppFilters } from "@/types/applications";
import { cn } from "@/lib/utils";

const ALL_ENVS = ["prod", "uat", "dev"] as const;
const ALL_CRITS = ["T0", "T1", "T2", "T3"] as const;
const ALL_STATUSES = ["healthy", "warning", "degraded", "critical", "unknown"] as const;

export const EMPTY_FILTERS: AppFilters = {
  search: "", environments: [], criticalities: [], statuses: [], departments: [], regions: [], types: [],
};

export function useAppFilters(apps: Application[]) {
  const [filters, setFilters] = useState<AppFilters>(EMPTY_FILTERS);
  const filtered = useMemo(() => {
    return apps.filter((a) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (![a.name, a.team, a.department, a.businessOwner, a.technicalOwner, ...(a.tags ?? [])]
          .filter(Boolean).some((s) => s.toLowerCase().includes(q))) return false;
      }
      if (filters.environments.length && !filters.environments.includes(a.environment)) return false;
      if (filters.criticalities.length && !filters.criticalities.includes(a.criticality)) return false;
      if (filters.statuses.length && !filters.statuses.includes(a.status)) return false;
      if (filters.departments.length && !filters.departments.includes(a.department)) return false;
      if (filters.regions.length && !filters.regions.includes(a.region)) return false;
      if (filters.types.length && !filters.types.includes(a.type)) return false;
      return true;
    });
  }, [apps, filters]);
  return { filters, setFilters, filtered };
}

function Chip<T extends string>({ value, active, onClick, label }: { value: T; active: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      )}
    >
      {label ?? value}
    </button>
  );
}

export function AppFiltersBar({
  apps, filters, setFilters,
}: { apps: Application[]; filters: AppFilters; setFilters: (f: AppFilters) => void }) {
  const depts = useMemo(() => Array.from(new Set(apps.map((a) => a.department))).sort(), [apps]);
  const regions = useMemo(() => Array.from(new Set(apps.map((a) => a.region))).sort(), [apps]);
  const types = useMemo(() => Array.from(new Set(apps.map((a) => a.type))).sort(), [apps]);
  const toggle = <K extends keyof AppFilters>(k: K, v: AppFilters[K] extends Array<infer U> ? U : never) => {
    const arr = filters[k] as unknown as string[];
    const next = arr.includes(v as string) ? arr.filter((x) => x !== v) : [...arr, v as string];
    setFilters({ ...filters, [k]: next } as AppFilters);
  };
  const active =
    filters.search ||
    filters.environments.length || filters.criticalities.length ||
    filters.statuses.length || filters.departments.length ||
    filters.regions.length || filters.types.length;

  return (
    <div className="space-y-2 rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search by app, team, owner, tag…"
            className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-2 text-sm outline-none focus:border-primary"
          />
        </div>
        {active ? (
          <button
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" /> Reset
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-3">
        <Group label="Env">
          {ALL_ENVS.map((v) => <Chip key={v} value={v} active={filters.environments.includes(v)} onClick={() => toggle("environments", v)} />)}
        </Group>
        <Group label="Tier">
          {ALL_CRITS.map((v) => <Chip key={v} value={v} active={filters.criticalities.includes(v)} onClick={() => toggle("criticalities", v)} />)}
        </Group>
        <Group label="Status">
          {ALL_STATUSES.map((v) => <Chip key={v} value={v} active={filters.statuses.includes(v)} onClick={() => toggle("statuses", v)} />)}
        </Group>
        <Group label="Type">
          {types.map((v) => <Chip key={v} value={v} active={filters.types.includes(v)} onClick={() => toggle("types", v)} />)}
        </Group>
        <Group label="Dept">
          {depts.map((v) => <Chip key={v} value={v} active={filters.departments.includes(v)} onClick={() => toggle("departments", v)} />)}
        </Group>
        <Group label="Region">
          {regions.map((v) => <Chip key={v} value={v} active={filters.regions.includes(v)} onClick={() => toggle("regions", v)} />)}
        </Group>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}
