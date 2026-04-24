import { useState } from "react";
import {
  LayoutDashboard,
  AlertTriangle,
  Sparkles,
  Server,
  TerminalSquare,
  GaugeCircle,
  Settings,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const items: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "incidents", label: "Incidents", icon: AlertTriangle, badge: 3 },
  { id: "ai", label: "AI Insights", icon: Sparkles },
  { id: "infra", label: "Infrastructure", icon: Server },
  { id: "chatops", label: "ChatOps Terminal", icon: TerminalSquare, badge: "live" },
  { id: "sla", label: "SLA & Reports", icon: GaugeCircle },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  active: string;
  onSelect: (id: string) => void;
}

export const Sidebar = ({ active, onSelect }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative z-20 flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl transition-[width] duration-500 ease-out",
        collapsed ? "w-[76px]" : "w-[260px]",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="relative">
          <img src={logo} alt="Nexus AIOps logo" className="h-9 w-9 rounded-md object-contain" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-sidebar shadow-[0_0_8px_hsl(var(--success))]" />
        </div>
        {!collapsed && (
          <div className="min-w-0 animate-fade-in">
            <p className="truncate text-sm font-semibold tracking-tight text-sidebar-accent-foreground">Nexus AIOps</p>
            <p className="truncate text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Control Center</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300",
                "hover:bg-sidebar-accent/70 hover:translate-x-0.5",
                isActive
                  ? "bg-gradient-to-r from-primary/15 to-transparent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground",
              )}
              title={collapsed ? item.label : undefined}
            >
              {isActive && (
                <span className="absolute inset-y-1 left-0 w-[3px] rounded-r-full bg-gradient-to-b from-primary-glow to-primary shadow-[0_0_12px_hsl(var(--primary-glow))]" />
              )}
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive ? "text-primary-glow" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground",
                )}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate text-left">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        item.badge === "live"
                          ? "bg-success/15 text-success ring-1 ring-success/30"
                          : "bg-destructive/15 text-destructive ring-1 ring-destructive/30",
                      )}
                    >
                      {item.badge === "live" && (
                        <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success" />
                      )}
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer: trust indicator */}
      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border border-success/20 bg-success/5 p-3",
            collapsed && "justify-center p-2",
          )}
        >
          <ShieldCheck className="h-5 w-5 shrink-0 text-success" />
          {!collapsed && (
            <div className="min-w-0 animate-fade-in">
              <p className="truncate text-xs font-semibold text-foreground">JWT Verified</p>
              <p className="truncate text-[10px] text-muted-foreground">RBAC: Site Reliability</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="mt-3 flex w-full items-center justify-center rounded-lg border border-sidebar-border py-1.5 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary-glow"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-500", collapsed && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
};
