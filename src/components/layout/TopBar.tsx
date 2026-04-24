import { Bell, Search, Command, ChevronDown, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export const TopBar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border/60 bg-background/60 px-4 backdrop-blur-xl md:px-6">
      {/* Breadcrumb / status */}
      <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
        <span className="flex h-2 w-2 items-center justify-center">
          <span className="absolute h-2 w-2 animate-ping rounded-full bg-success opacity-60" />
          <span className="relative h-2 w-2 rounded-full bg-success" />
        </span>
        <span className="font-mono uppercase tracking-wider">All systems operational</span>
        <span className="text-border">·</span>
        <span className="font-mono">{time.toLocaleTimeString("en-US", { hour12: false })} UTC</span>
      </div>

      {/* Search */}
      <div className="ml-auto flex max-w-xl flex-1 items-center">
        <div className="group relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary-glow" />
          <input
            placeholder="Ask AI: 'Why is api-gateway-3 lagging?'"
            className="h-10 w-full rounded-lg border border-border/60 bg-background-elevated/50 pl-9 pr-20 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-background-elevated focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.08)]"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
            <kbd className="hidden items-center gap-1 rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 bg-background-elevated/50 text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground">
        <Bell className="h-4 w-4" />
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground ring-2 ring-background">
          7
        </span>
      </button>

      {/* User */}
      <button className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-background-elevated/50 p-1.5 pr-3 transition-all hover:border-primary/40">
        <div className="relative h-7 w-7 overflow-hidden rounded-md bg-gradient-primary text-[11px] font-semibold text-primary-foreground">
          <span className="flex h-full w-full items-center justify-center">AK</span>
        </div>
        <div className="hidden text-left md:block">
          <p className="text-xs font-semibold leading-tight text-foreground">Adrien K.</p>
          <p className="text-[10px] leading-tight text-muted-foreground">SRE · Admin</p>
        </div>
        <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
      </button>
    </header>
  );
};
