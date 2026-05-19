import { useNavigate } from "react-router-dom";
import { Network } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TopologyGraph } from "@/components/applications/TopologyGraph";
import { useApplications } from "@/hooks/useApplications";

export default function ApplicationsTopology() {
  const { data: apps = [] } = useApplications();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Application Service Map"
        subtitle="Cross-application dependencies · blast radius analysis"
        icon={Network}
      />
      <div className="p-4 sm:p-6">
        <TopologyGraph apps={apps} onSelect={(id) => navigate(`/applications/${id}`)} />
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <Legend color="#10b981" label="Healthy" />
          <Legend color="#eab308" label="Warning" />
          <Legend color="#f97316" label="Degraded" />
          <Legend color="#dc2626" label="Critical" />
          <span>· Dashed line = DB dependency · Solid = service/API dependency</span>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} /> {label}
    </span>
  );
}
