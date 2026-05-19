import { useMemo, useRef, useState } from "react";
import type { Application } from "@/types/applications";

interface Node { id: string; label: string; x: number; y: number; status: string; type: string }
interface Edge { from: string; to: string; kind: string }

const STATUS_COLOR: Record<string, string> = {
  healthy: "#10b981", warning: "#eab308", degraded: "#f97316", critical: "#dc2626", unknown: "#94a3b8",
};

export function TopologyGraph({ apps, onSelect }: { apps: Application[]; onSelect?: (id: string) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    // Radial circle layout grouped by department
    const grouped = new Map<string, Application[]>();
    apps.forEach((a) => {
      const arr = grouped.get(a.department) ?? [];
      arr.push(a); grouped.set(a.department, arr);
    });
    const depts = Array.from(grouped.keys());
    const W = 1200, H = 720, cx = W / 2, cy = H / 2;
    const placedNodes: Node[] = [];
    depts.forEach((d, di) => {
      const angle = (di / Math.max(1, depts.length)) * Math.PI * 2;
      const radius = 240 + (depts.length > 4 ? 30 : 0);
      const gcx = cx + Math.cos(angle) * radius;
      const gcy = cy + Math.sin(angle) * radius;
      const group = grouped.get(d)!;
      group.forEach((a, i) => {
        const innerA = (i / Math.max(1, group.length)) * Math.PI * 2;
        const innerR = 70 + group.length * 6;
        placedNodes.push({
          id: a.id, label: a.name, status: a.status, type: a.type,
          x: gcx + Math.cos(innerA) * innerR, y: gcy + Math.sin(innerA) * innerR,
        });
      });
    });
    const idSet = new Set(placedNodes.map((n) => n.id));
    const placedEdges: Edge[] = [];
    apps.forEach((a) => {
      a.dependencies.forEach((dep) => {
        if (idSet.has(dep.appId)) placedEdges.push({ from: a.id, to: dep.appId, kind: dep.kind });
      });
    });
    return { nodes: placedNodes, edges: placedEdges };
  }, [apps]);

  const highlighted = useMemo(() => {
    if (!hover) return new Set<string>();
    const out = new Set<string>([hover]);
    edges.forEach((e) => {
      if (e.from === hover) out.add(e.to);
      if (e.to === hover) out.add(e.from);
    });
    return out;
  }, [hover, edges]);

  return (
    <div ref={wrapRef} className="relative w-full overflow-hidden rounded-xl border border-border bg-card">
      <svg viewBox="0 0 1200 720" className="h-[640px] w-full">
        <defs>
          <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.06" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="1200" height="720" fill="url(#bg-glow)" />

        {edges.map((e, i) => {
          const a = nodes.find((n) => n.id === e.from);
          const b = nodes.find((n) => n.id === e.to);
          if (!a || !b) return null;
          const dim = hover && !(highlighted.has(a.id) && highlighted.has(b.id));
          return (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={dim ? "hsl(var(--border))" : "hsl(var(--primary))"}
              strokeOpacity={dim ? 0.25 : 0.5}
              strokeWidth={dim ? 1 : 1.5}
              strokeDasharray={e.kind === "db" ? "4 4" : undefined}
            />
          );
        })}

        {nodes.map((n) => {
          const isHover = hover === n.id;
          const isHL = highlighted.size === 0 || highlighted.has(n.id);
          const r = isHover ? 22 : 16;
          return (
            <g key={n.id}
              style={{ cursor: "pointer", opacity: isHL ? 1 : 0.3 }}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect?.(n.id)}
            >
              <circle cx={n.x} cy={n.y} r={r + 6} fill={STATUS_COLOR[n.status]} opacity={0.15} />
              <circle cx={n.x} cy={n.y} r={r} fill={STATUS_COLOR[n.status]} stroke="white" strokeWidth={2} />
              <text x={n.x} y={n.y + r + 14} textAnchor="middle"
                style={{ fontSize: 11, fontWeight: 600, fill: "hsl(var(--foreground))" }}>
                {n.label}
              </text>
              <text x={n.x} y={n.y + r + 27} textAnchor="middle"
                style={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}>
                {n.type}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute bottom-3 right-3 rounded-md border border-border bg-background/90 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">
        Hover to highlight blast radius · click to open application
      </div>
    </div>
  );
}
