import { useState } from "react";
import { Link } from "react-router-dom";
import { Boxes, Edit, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApplications, useDeleteApplication } from "@/hooks/useApplications";
import { AppCreateDialog } from "@/components/applications/AppCreateDialog";
import { AppFiltersBar, useAppFilters } from "@/components/applications/AppFilters";
import { AppStatusBadge } from "@/components/applications/AppStatusBadge";
import type { Application } from "@/types/applications";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function ApplicationsRegistry() {
  const { data: apps = [] } = useApplications();
  const { filters, setFilters, filtered } = useAppFilters(apps);
  const [editing, setEditing] = useState<Application | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const del = useDeleteApplication();
  const { hasRole } = useAuth();
  const canWrite = hasRole("admin") || hasRole("operator") || hasRole("super_admin");

  const onDelete = async (a: Application) => {
    if (!confirm(`Delete ${a.name}?`)) return;
    await del.mutateAsync(a.id);
    toast({ title: "Application deleted", description: a.name });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Application Registry"
        subtitle="Enterprise application CMDB · register apps, owners, servers, monitoring scope"
        icon={Boxes}
        actions={
          canWrite ? (
            <Button size="sm" onClick={() => { setEditing(undefined); setCreateOpen(true); }}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />Register application
            </Button>
          ) : null
        }
      />

      <div className="space-y-4 p-4 sm:p-6">
        <AppFiltersBar apps={apps} filters={filters} setFilters={setFilters} />

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <article key={a.id} className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40">
              <header className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link to={`/applications/${a.id}`} className="block truncate text-base font-semibold hover:text-primary">{a.name}</Link>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono">{a.criticality}</span>
                    <span className="uppercase">{a.environment}</span>
                    <span>·</span>
                    <span>{a.type}</span>
                  </div>
                </div>
                <AppStatusBadge status={a.status} />
              </header>

              <dl className="mt-3 grid grid-cols-2 gap-1 text-[11px]">
                <Cell k="Owner" v={a.businessOwner} />
                <Cell k="Tech lead" v={a.technicalOwner} />
                <Cell k="Team" v={a.team} />
                <Cell k="Region" v={a.region} />
                <Cell k="Servers" v={`${a.hostIds.length}`} />
                <Cell k="SLA" v={`${a.slaTarget}%`} />
              </dl>

              {a.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {a.tags.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                </div>
              )}

              {canWrite && (
                <footer className="mt-3 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(a); setCreateOpen(true); }}>
                    <Edit className="mr-1 h-3.5 w-3.5" />Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(a)} className="text-destructive hover:text-destructive">
                    <Trash2 className="mr-1 h-3.5 w-3.5" />Delete
                  </Button>
                </footer>
              )}
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              No applications match these filters.
            </div>
          )}
        </div>
      </div>

      <AppCreateDialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) setEditing(undefined); }} initial={editing} />
    </div>
  );
}

function Cell({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="truncate text-right font-medium">{v || "—"}</dd>
    </>
  );
}
