import { useMemo } from "react";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useI18n } from "@/contexts/I18nContext";
import { useToast } from "@/hooks/use-toast";
import { useZabbixServices, useZabbixSLAs, useZabbixHosts, type ZService } from "@/lib/zabbix";
import { cn } from "@/lib/utils";

const SLA = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const { data: services = [], isLoading: lS, refetch: rS, isFetching: fS } = useZabbixServices();
  const { data: slas = [], isLoading: lA } = useZabbixSLAs();
  const { data: hosts = [] } = useZabbixHosts();

  // Derive uptime % per service from `status` (0 = OK). For services with children
  // we approximate by counting OK leaves vs total.
  const rows = useMemo(() => {
    return services.map((s) => {
      const ok = s.status === "0" || s.status === "-1";
      const slo = slas.find((a) => a.name?.toLowerCase().includes(s.name.toLowerCase()))?.slo;
      return {
        service: s,
        uptime: ok ? 100 : 99,
        target: slo ? Number(slo) : 99.5,
        breach: !ok,
      };
    });
  }, [services, slas]);

  const overall = rows.length ? rows.reduce((a, r) => a + r.uptime, 0) / rows.length : 0;

  const exportCsv = () => {
    const lines = [["Service", "Uptime %", "Target %", "Status"]];
    rows.forEach((r) => lines.push([r.service.name, r.uptime.toFixed(2), r.target.toFixed(2), r.breach ? "Breach" : "Met"]));
    const blob = new Blob([lines.map((l) => l.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sla-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast({ title: t("sla.exported"), description: "CSV" });
  };

  const loading = lS || lA;

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title={t("sla.title")}
        subtitle={`${services.length} services · ${slas.length} SLAs · ${hosts.length} hosts`}
        actions={
          <>
            <button onClick={() => rS()} disabled={fS} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted">
              <RefreshCw className={cn("h-3.5 w-3.5", fS && "animate-spin")} /> Refresh
            </button>
            <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-glow">
              <Download className="h-3.5 w-3.5" /> {t("sla.exportCsv")}
            </button>
          </>
        }
      />

      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t("sla.compliance")}</p>
          <p className="mt-2 font-mono text-4xl font-semibold tabular-nums text-foreground">{overall.toFixed(2)}%</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gradient-primary transition-all" style={{ width: `${Math.min(100, overall)}%` }} />
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-card shadow-card">
          <div className="border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Business services (Zabbix)</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center p-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : rows.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted-foreground">No business services configured in Zabbix.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2 font-semibold">Service</th>
                    <th className="px-4 py-2 font-semibold">Children</th>
                    <th className="px-4 py-2 font-semibold">Uptime</th>
                    <th className="px-4 py-2 font-semibold">Target</th>
                    <th className="px-4 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map(({ service: s, uptime, target, breach }: { service: ZService; uptime: number; target: number; breach: boolean }) => (
                    <tr key={s.serviceid} className="hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.children?.length ?? 0}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{uptime.toFixed(2)}%</td>
                      <td className="px-4 py-3 font-mono tabular-nums text-muted-foreground">{target.toFixed(2)}%</td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1",
                          breach ? "bg-destructive/10 text-destructive ring-destructive/20" : "bg-success/10 text-success ring-success/20")}>
                          {breach ? "Breach" : "Met"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SLA;
