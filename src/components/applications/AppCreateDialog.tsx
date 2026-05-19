import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type {
  Application, AppCriticality, AppEnvironment, AppRegion, AppType, MonitoringScope,
} from "@/types/applications";
import { DEFAULT_SCOPE } from "@/types/applications";
import { HOSTS } from "@/data/monitoringMock";
import { useUpsertApplication } from "@/hooks/useApplications";
import { toast } from "@/hooks/use-toast";

const SCOPE_FIELDS: { key: keyof MonitoringScope; label: string }[] = [
  { key: "infrastructure", label: "Infrastructure metrics" },
  { key: "cpu", label: "CPU" },
  { key: "memory", label: "Memory" },
  { key: "disk", label: "Disk" },
  { key: "network", label: "Network" },
  { key: "availability", label: "Availability" },
  { key: "logs", label: "Logs" },
  { key: "database", label: "Database health" },
  { key: "apiLatency", label: "API latency" },
  { key: "httpStatus", label: "HTTP status" },
  { key: "sslExpiration", label: "SSL expiration" },
  { key: "jobs", label: "Scheduled jobs" },
  { key: "cronJobs", label: "Cron jobs" },
  { key: "queueDepth", label: "Queue depth" },
  { key: "containers", label: "Containers" },
  { key: "k8sPods", label: "Kubernetes pods" },
  { key: "jvm", label: "JVM metrics" },
  { key: "processHealth", label: "Process health" },
  { key: "servicePorts", label: "Service ports" },
  { key: "errorRate", label: "Error rate" },
  { key: "responseTime", label: "Response time" },
  { key: "businessKpis", label: "Business KPIs" },
];

const blank = (): Application => ({
  id: `app-${Date.now().toString(36)}`,
  name: "", type: "web", environment: "prod", criticality: "T2", status: "unknown",
  businessOwner: "", technicalOwner: "", team: "", department: "Apps", region: "EMEA",
  slaTarget: 99.9, slaActual: 100, healthScore: 100, riskScore: 0,
  errorRate: 0, availability: 100, latencyP95Ms: 0, activeIncidents: 0,
  lastDeployment: new Date().toISOString(),
  hostIds: [], tags: [], scope: { ...DEFAULT_SCOPE }, jobs: [], endpoints: [],
  recentLogs: [], dependencies: [], updatedAt: new Date().toISOString(),
});

export function AppCreateDialog({
  open, onOpenChange, initial,
}: { open: boolean; onOpenChange: (v: boolean) => void; initial?: Application }) {
  const [app, setApp] = useState<Application>(initial ?? blank());
  const [tagInput, setTagInput] = useState("");
  const upsert = useUpsertApplication();

  const submit = async () => {
    if (!app.name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    await upsert.mutateAsync(app);
    toast({ title: initial ? "Application updated" : "Application created", description: app.name });
    onOpenChange(false);
  };

  const toggleHost = (id: string) => setApp((a) =>
    ({ ...a, hostIds: a.hostIds.includes(id) ? a.hostIds.filter((h) => h !== id) : [...a.hostIds, id] }));
  const toggleScope = (k: keyof MonitoringScope) => setApp((a) => ({ ...a, scope: { ...a.scope, [k]: !a.scope[k] } }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit application" : "Register new application"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2 md:grid-cols-2">
          <Field label="Name *">
            <Input value={app.name} onChange={(e) => setApp({ ...app, name: e.target.value })} placeholder="e.g. Billing API" />
          </Field>
          <Field label="Type">
            <Select value={app.type} onValueChange={(v) => setApp({ ...app, type: v as AppType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["web","api","database","batch","worker","scheduler","middleware","kubernetes","vm"].map((t) =>
                  <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Environment">
            <Select value={app.environment} onValueChange={(v) => setApp({ ...app, environment: v as AppEnvironment })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["prod","uat","dev"].map((t) => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Criticality">
            <Select value={app.criticality} onValueChange={(v) => setApp({ ...app, criticality: v as AppCriticality })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["T0","T1","T2","T3"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Business owner"><Input value={app.businessOwner} onChange={(e) => setApp({ ...app, businessOwner: e.target.value })} /></Field>
          <Field label="Technical owner"><Input value={app.technicalOwner} onChange={(e) => setApp({ ...app, technicalOwner: e.target.value })} /></Field>
          <Field label="Team"><Input value={app.team} onChange={(e) => setApp({ ...app, team: e.target.value })} /></Field>
          <Field label="Department"><Input value={app.department} onChange={(e) => setApp({ ...app, department: e.target.value })} /></Field>
          <Field label="Region">
            <Select value={app.region} onValueChange={(v) => setApp({ ...app, region: v as AppRegion })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["EMEA","Americas","APAC","Africa"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="SLA target %">
            <Input type="number" min={0} max={100} step={0.01} value={app.slaTarget}
              onChange={(e) => setApp({ ...app, slaTarget: parseFloat(e.target.value) || 0 })} />
          </Field>
          <Field className="md:col-span-2" label="Description">
            <Textarea value={app.description ?? ""} onChange={(e) => setApp({ ...app, description: e.target.value })} rows={2} />
          </Field>

          <Field className="md:col-span-2" label="Servers / hosts">
            <div className="flex flex-wrap gap-1.5 rounded-md border border-border p-2">
              {HOSTS.map((h) => {
                const on = app.hostIds.includes(h.id);
                return (
                  <button key={h.id} type="button" onClick={() => toggleHost(h.id)}
                    className={`rounded-md border px-2 py-1 text-xs ${on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    {h.name}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field className="md:col-span-2" label="Tags">
            <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border p-2">
              {app.tags.map((t) => (
                <Badge key={t} variant="secondary" className="cursor-pointer"
                  onClick={() => setApp({ ...app, tags: app.tags.filter((x) => x !== t) })}>
                  {t} ×
                </Badge>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagInput.trim()) {
                    e.preventDefault();
                    setApp({ ...app, tags: Array.from(new Set([...app.tags, tagInput.trim()])) });
                    setTagInput("");
                  }
                }}
                placeholder="Add tag and press Enter"
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
            </div>
          </Field>

          <div className="md:col-span-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monitoring scope</p>
            <div className="grid gap-1.5 rounded-md border border-border p-3 sm:grid-cols-2 md:grid-cols-3">
              {SCOPE_FIELDS.map((f) => (
                <label key={f.key} className="flex items-center gap-2 text-xs">
                  <Checkbox checked={app.scope[f.key]} onCheckedChange={() => toggleScope(f.key)} />
                  {f.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={upsert.isPending}>{initial ? "Save changes" : "Create application"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
