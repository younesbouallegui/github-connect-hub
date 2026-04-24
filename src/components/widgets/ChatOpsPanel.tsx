import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Brain,
  CheckCircle2,
  ChevronRight,
  Hammer,
  RotateCw,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AiAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "primary" | "ghost";
}

interface ChatMessage {
  id: number;
  role: "user" | "ai";
  content?: string;
  ai?: {
    rootCause: string;
    confidence: number;
    suggested: string[];
    actions: AiAction[];
    secure: boolean;
  };
  thinking?: boolean;
}

const initial: ChatMessage[] = [
  {
    id: 1,
    role: "user",
    content: "/diagnose payment-svc — p99 latency spiked at 14:02 UTC",
  },
  {
    id: 2,
    role: "ai",
    ai: {
      rootCause:
        "Upstream connection pool exhaustion on stripe-webhook.eu-west-1. Pod payment-svc-7d4 holding 98% of available sockets due to a stale TLS session that bypassed the keepalive recycler.",
      confidence: 96.4,
      suggested: [
        "Restart pod payment-svc-7d4 (rolling, zero-downtime)",
        "Reduce idle-socket TTL from 300s → 60s in chart values",
        "Open post-mortem draft & link to INC-2401",
      ],
      actions: [
        { label: "Restart Pod", icon: RotateCw, variant: "primary" },
        { label: "Apply Fix", icon: Hammer, variant: "ghost" },
        { label: "Deep Analyze", icon: Search, variant: "ghost" },
      ],
      secure: true,
    },
  },
];

const suggestions = [
  "/incidents open",
  "/scale api-gateway +2",
  "/sla last 24h",
  "/runbook db-failover",
];

export const ChatOpsPanel = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const id = Date.now();
    setMessages((m) => [
      ...m,
      { id, role: "user", content: input },
      { id: id + 1, role: "ai", thinking: true },
    ]);
    setInput("");

    setTimeout(() => {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === id + 1
            ? {
                ...msg,
                thinking: false,
                ai: {
                  rootCause:
                    "Correlation analysis across 3 services suggests a node-level memory pressure event on worker-eu-04 affecting co-located pods.",
                  confidence: 89.2,
                  suggested: [
                    "Cordon worker-eu-04 and drain workloads",
                    "Investigate kernel slab cache growth",
                    "Notify on-call: SRE Tier-2",
                  ],
                  actions: [
                    { label: "Cordon Node", icon: ShieldCheck, variant: "primary" },
                    { label: "Drain & Migrate", icon: RotateCw, variant: "ghost" },
                    { label: "Page Tier-2", icon: Sparkles, variant: "ghost" },
                  ],
                  secure: true,
                },
              }
            : msg,
        ),
      );
    }, 1800);
  };

  return (
    <div className="glass-strong relative flex h-full flex-col overflow-hidden rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Brain className="h-4 w-4 text-primary-foreground" />
            <span className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full bg-success ring-2 ring-background shadow-[0_0_6px_hsl(var(--success))]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Nexus AI · ChatOps</h3>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Terminal className="h-3 w-3" />
              <span className="font-mono">prod · eu-west-1 · context: 12 services</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-2 py-1 text-[10px] font-semibold text-success">
          <ShieldCheck className="h-3 w-3" /> JWT Verified
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m) => (m.role === "user" ? <UserMsg key={m.id} text={m.content!} /> : <AiMsg key={m.id} msg={m} />))}
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5 border-t border-border/60 px-4 py-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => setInput(s)}
            className="rounded-md border border-border/60 bg-background-elevated/40 px-2 py-1 font-mono text-[10px] text-muted-foreground transition-all hover:border-primary/40 hover:text-primary-glow"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border/60 p-3">
        <div className="group relative flex items-center gap-2 rounded-lg border border-border/60 bg-background-elevated/60 px-3 py-2 transition-all focus-within:border-primary/50 focus-within:shadow-[0_0_0_4px_hsl(var(--primary)/0.08)]">
          <ChevronRight className="h-4 w-4 text-primary-glow" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a command or ask the AI…"
            className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          />
          <span className="h-4 w-[2px] animate-blink bg-primary-glow" />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground shadow-glow transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
          Actions executed are <span className="text-success">JWT-secured</span> · audit trail enabled
        </p>
      </div>
    </div>
  );
};

const UserMsg = ({ text }: { text: string }) => (
  <div className="flex justify-end animate-fade-up">
    <div className="max-w-[85%] rounded-2xl rounded-br-md border border-border/60 bg-background-elevated/60 px-4 py-2.5 font-mono text-xs text-foreground/90">
      {text}
    </div>
  </div>
);

const AiMsg = ({ msg }: { msg: ChatMessage }) => (
  <div className="flex gap-3 animate-fade-up">
    <div className={cn("relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-primary", msg.thinking && "ai-pulse")}>
      <Brain className="h-4 w-4 text-primary-foreground" />
    </div>
    <div className="min-w-0 flex-1">
      {msg.thinking ? (
        <div className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background-elevated/60 px-4 py-2.5">
          <span className="text-xs text-muted-foreground">Nexus AI is analyzing</span>
          <span className="flex gap-1">
            <span className="h-1 w-1 animate-pulse-soft rounded-full bg-primary-glow [animation-delay:0ms]" />
            <span className="h-1 w-1 animate-pulse-soft rounded-full bg-primary-glow [animation-delay:200ms]" />
            <span className="h-1 w-1 animate-pulse-soft rounded-full bg-primary-glow [animation-delay:400ms]" />
          </span>
        </div>
      ) : msg.ai ? (
        <div className="space-y-3 rounded-xl border border-border/60 bg-background-elevated/40 p-4">
          {/* Confidence */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Root Cause Analysis</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-muted-foreground">confidence</span>
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-glow"
                  style={{ width: `${msg.ai.confidence}%`, transition: "width 1s var(--ease-out-expo)" }}
                />
              </div>
              <span className="font-mono text-[11px] font-semibold text-primary-glow tabular-nums">{msg.ai.confidence}%</span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-foreground">{msg.ai.rootCause}</p>

          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Suggested Actions</p>
            <ul className="space-y-1">
              {msg.ai.suggested.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground/85">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary-glow" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {msg.ai.actions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  className={cn(
                    "group inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-300",
                    a.variant === "primary"
                      ? "bg-gradient-primary text-primary-foreground shadow-glow hover:scale-[1.03]"
                      : "border border-border/60 bg-background-elevated/40 text-foreground/85 hover:border-primary/40 hover:text-primary-glow",
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {a.label}
                  {msg.ai!.secure && a.variant === "primary" && (
                    <ShieldCheck className="h-3 w-3 opacity-90" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  </div>
);
