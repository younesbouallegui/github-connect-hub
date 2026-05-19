import { useMemo, useState } from "react";
import { Bell, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useApplications, useAlertRules, useUpsertAlertRule, useDeleteAlertRule } from "@/hooks/useApplications";
import type { AppAlertRule, AlertChannel } from "@/types/applications";
import { toast } from "@/hooks/use-toast";

const CHANNELS: AlertChannel[] = ["email", "slack", "teams", "webhook", "zabbix"];

export default function ApplicationsAlerts() {
  const { data: apps = [] } = useApplications();
  const { data: rules = [] } = useAlertRules();
  const upsert = useUpsertAlertRule();
  const del = useDeleteAlertRule();
  const [editing, setEditing] = useState<AppAlertRule | null>(null);
  const [open, setOpen] = useState(false);

  const appName = useMemo(() => {
    const m = new Map(apps.map((a) => [a.id, a.name]));
    return (id: string) => m.get(id) ?? id;
  }, [apps]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Application Alerting Engine"
        subtitle={`${rules.length} rules · email · slack · teams · webhook · zabbix`}
        icon={Bell}
        actions={
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />New rule
          </Button>
        }
      />

      <div className="space-y-4 p-4 sm:p-6">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Rule</th>
                <th className="px-3 py-2">Application</th>
                <th className="px-3 py-2">Condition</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Channels</th>
                <th className="px-3 py-2">Enabled</th>
                <th className="px-3 py-2">Last triggered</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-t border-border/60 hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{r.name}</td>
                  <td className="px-3 py-2 text-xs">{appName(r.appId)}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{r.condition}</td>
                  <td className="px-3 py-2">
                    <Badge variant={r.severity === "critical" ? "destructive" : r.severity === "warning" ? "default" : "secondary"}>{r.severity}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {r.channels.map((c) => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Switch checked={r.enabled} onCheckedChange={(v) => upsert.mutate({ ...r, enabled: v })} />
                  </td>
                  <td className="px-3 py-2 text-[11px] text-muted-foreground">
                    {r.lastTriggered ? new Date(r.lastTriggered).toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}>Edit</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => {
                      if (!confirm(`Delete rule "${r.name}"?`)) return;
                      await del.mutateAsync(r.id);
                      toast({ title: "Rule deleted" });
                    }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {rules.length === 0 && <tr><td colSpan={8} className="px-3 py-12 text-center text-sm text-muted-foreground">No alert rules yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <RuleDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        apps={apps.map((a) => ({ id: a.id, name: a.name }))}
        onSave={async (r) => { await upsert.mutateAsync(r); toast({ title: "Rule saved" }); setOpen(false); }}
      />
    </div>
  );
}

function RuleDialog({
  open, onOpenChange, initial, apps, onSave,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; initial: AppAlertRule | null;
  apps: { id: string; name: string }[]; onSave: (r: AppAlertRule) => void;
}) {
  const [rule, setRule] = useState<AppAlertRule>(() => initial ?? {
    id: `ar-${Date.now().toString(36)}`,
    appId: apps[0]?.id ?? "",
    name: "", condition: "", severity: "warning", channels: ["email"], enabled: true,
  });

  // Reset when opening
  if (open && rule.id !== (initial?.id ?? rule.id)) {
    setRule(initial ?? { id: `ar-${Date.now().toString(36)}`, appId: apps[0]?.id ?? "", name: "", condition: "", severity: "warning", channels: ["email"], enabled: true });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial ? "Edit alert rule" : "New alert rule"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          <div>
            <Label className="mb-1 text-[11px] uppercase">Rule name</Label>
            <Input value={rule.name} onChange={(e) => setRule({ ...rule, name: e.target.value })} placeholder="e.g. Error rate spike" />
          </div>
          <div>
            <Label className="mb-1 text-[11px] uppercase">Application</Label>
            <Select value={rule.appId} onValueChange={(v) => setRule({ ...rule, appId: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{apps.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 text-[11px] uppercase">Condition</Label>
            <Input value={rule.condition} onChange={(e) => setRule({ ...rule, condition: e.target.value })} placeholder="error_rate > 3% for 5m" />
          </div>
          <div>
            <Label className="mb-1 text-[11px] uppercase">Severity</Label>
            <Select value={rule.severity} onValueChange={(v) => setRule({ ...rule, severity: v as AppAlertRule["severity"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="info">info</SelectItem>
                <SelectItem value="warning">warning</SelectItem>
                <SelectItem value="critical">critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 text-[11px] uppercase">Notification channels</Label>
            <div className="flex flex-wrap gap-3 rounded-md border border-border p-2">
              {CHANNELS.map((c) => (
                <label key={c} className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={rule.channels.includes(c)}
                    onCheckedChange={() => setRule({
                      ...rule,
                      channels: rule.channels.includes(c) ? rule.channels.filter((x) => x !== c) : [...rule.channels, c],
                    })}
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(rule)} disabled={!rule.name || !rule.condition || !rule.appId}>Save rule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
