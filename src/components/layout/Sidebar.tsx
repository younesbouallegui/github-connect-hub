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
  X,
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
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar = ({ active, onSelect, mobileOpen, onMobileClose }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleSelect = (id: string) => {
    onSelect(id);
    onMobileClose();
  };

  const content = (isMobile: boolean) => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="relative">
          <img src={logo} alt="Poulina ChatOps logo" className="h-9 w-9 rounded-md object-contain" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-sidebar" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="min-w-0 flex-1 animate-fade-in">
            <p className="truncate text-sm font-semibold tracking-tight text-sidebar-accent-foreground">
              Poulina ChatOps
            </p>
            <p className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              AI Operations
            </p>
          </div>
        )}
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
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
              onClick={() => handleSelect(item.id)}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "hover:bg-sidebar-accent",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground",
              )}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              {isActive && (
                <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground",
                )}
              />
              {(!collapsed || isMobile) && (
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

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border border-success/20 bg-success/5 p-3",
            collapsed && !isMobile && "justify-center p-2",
          )}
        >
          <ShieldCheck className="h-5 w-5 shrink-0 text-success" />
          {(!collapsed || isMobile) && (
            <div className="min-w-0 animate-fade-in">
              <p className="truncate text-xs font-semibold text-foreground">Session Secured</p>
              <p className="truncate text-[10px] text-muted-foreground">SSO · audit trail on</p>
            </div>
          )}
        </div>

        {!isMobile && (
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="mt-3 flex w-full items-center justify-center rounded-lg border border-sidebar-border py-1.5 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary active:scale-95"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", collapsed && "rotate-180")} />
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "relative z-20 hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-out md:flex",
          collapsed ? "w-[76px]" : "w-[260px]",
        )}
      >
        {content(false)}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
            onClick={onMobileClose}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-sidebar-border bg-sidebar shadow-elevated animate-slide-in-right [animation-duration:300ms]">
            {content(true)}
          </aside>
        </div>
      )}
    </>
  );
};
