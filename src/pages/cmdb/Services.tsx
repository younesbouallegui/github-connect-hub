import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { useI18n } from "@/contexts/I18nContext";
import { Layers, Loader2, ShieldAlert, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import type { Database as DB } from "@/integrations/supabase/types";

type Svc = DB["public"]["Tables"]["business_services"]["Row"];
type Asset = DB["public"]["Tables"]["assets"]["Row"];
type Map = DB["public"]["Tables"]["service_assets"]["Row"];

const CRIT_DOT: Record<string, string> = {
  critical: "bg-destructive",
  high: "bg-warning",
  medium: "bg-primary",
  low: "bg-muted-foreground",
};

const Services = () => {
  const { t } = useI18n();
  const [services, setServices] = useState<Svc[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [maps, setMaps] = useState<Map[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [s, a, m] = await Promise.all([
        supabase.from("business_services").select("*").order("name"),
        supabase.from("assets").select("*"),
        supabase.from("service_assets").select("*"),
      ]);
      if (mounted) {
        setServices(s.data ?? []);
        setAssets(a.data ?? []);
        setMaps(m.data ?? []);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const assetsByService = useMemo(() => {
    const out: Record<string, Asset[]> = {};
    for (const m of maps) {
      const a = assets.find((x) => x.id === m.asset_id);
      if (!a) continue;
      (out[m.service_id] ??= []).push(a);
    }
    return out;
  }, [assets, maps]);

  return (
    <div className="flex flex-col">
      <PageHeader
        title={t("cmdb.services.title")}
        subtitle={t("cmdb.services.subtitle")}
        icon={Layers}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 px-6 pb-8 md:grid-cols-2">
          {services.map((s) => {
            const list = assetsByService[s.id] ?? [];
            const critical = list.filter((a) => a.criticality === "critical").length;
            return (
              <article key={s.id} className="rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-elevated">
                <header className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${CRIT_DOT[s.criticality]}`} />
                      <h3 className="truncate text-base font-semibold text-foreground">{s.name}</h3>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("cmdb.services.sla")}</p>
                    <p className="text-lg font-semibold text-foreground">{Number(s.sla_target).toFixed(2)}%</p>
                  </div>
                </header>

                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                  <Stat icon={Layers} label={t("cmdb.services.assets")} value={list.length} />
                  <Stat icon={ShieldAlert} label={t("cmdb.services.critical")} value={critical} accent={critical > 0 ? "destructive" : undefined} />
                  <Stat icon={Activity} label={t("cmdb.services.criticality")} value={<span className="capitalize">{s.criticality}</span>} />
                </div>

                {list.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">{t("cmdb.services.dependencies")}</p>
                    <ul className="flex flex-wrap gap-1.5">
                      {list.map((a) => (
                        <li key={a.id}>
                          <Link
                            to={`/cmdb/assets/${a.id}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-[11px] text-foreground ring-1 ring-border transition-all hover:bg-primary/10 hover:text-primary hover:ring-primary/30"
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${CRIT_DOT[a.criticality]}`} />
                            {a.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Stat = ({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  accent?: "destructive";
}) => (
  <div>
    <Icon className={`mx-auto mb-1 h-4 w-4 ${accent === "destructive" ? "text-destructive" : "text-muted-foreground"}`} />
    <p className={`text-sm font-semibold ${accent === "destructive" ? "text-destructive" : "text-foreground"}`}>{value}</p>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
  </div>
);

export default Services;
