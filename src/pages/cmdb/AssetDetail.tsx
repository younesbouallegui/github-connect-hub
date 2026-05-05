import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { useI18n } from "@/contexts/I18nContext";
import {
  ArrowLeft,
  Server,
  GitBranch,
  Loader2,
  Tag,
  MapPin,
  Network,
  Cpu,
  Building2,
  ShieldAlert,
} from "lucide-react";
import type { Database as DB } from "@/integrations/supabase/types";

type Asset = DB["public"]["Tables"]["assets"]["Row"];
type Dep = DB["public"]["Tables"]["asset_dependencies"]["Row"];

const AssetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [deps, setDeps] = useState<Dep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      const [{ data: a }, { data: list }, { data: dList }] = await Promise.all([
        supabase.from("assets").select("*").eq("id", id).maybeSingle(),
        supabase.from("assets").select("*"),
        supabase.from("asset_dependencies").select("*").or(`source_asset_id.eq.${id},target_asset_id.eq.${id}`),
      ]);
      if (mounted) {
        setAsset(a ?? null);
        setAllAssets(list ?? []);
        setDeps(dList ?? []);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="px-6 py-10 text-center text-sm text-muted-foreground">
        Asset not found.
      </div>
    );
  }

  const assetById = (aid: string) => allAssets.find((x) => x.id === aid);
  const upstream = deps.filter((d) => d.source_asset_id === asset.id);
  const downstream = deps.filter((d) => d.target_asset_id === asset.id);

  return (
    <div className="flex flex-col">
      <PageHeader
        title={asset.name}
        subtitle={asset.hostname ?? "—"}
        icon={Server}
        action={
          <Link
            to="/cmdb/assets"
            className="flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("cmdb.detail.back")}
          </Link>
        }
      />

      <div className="grid gap-4 px-6 lg:grid-cols-3">
        <Card title={t("cmdb.detail.identity")} icon={Cpu}>
          <Row label={t("cmdb.detail.type")} value={asset.asset_type.replace("_", " ")} />
          <Row label={t("cmdb.detail.env")} value={asset.environment} />
          <Row label={t("cmdb.detail.os")} value={asset.os ?? "—"} />
          <Row label={t("cmdb.detail.status")} value={asset.status} />
        </Card>

        <Card title={t("cmdb.detail.network")} icon={Network}>
          <Row label="IP" value={asset.ip_address ?? "—"} />
          <Row label={t("cmdb.detail.hostname")} value={asset.hostname ?? "—"} />
          <Row label={<span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{t("cmdb.detail.location")}</span>} value={asset.location ?? "—"} />
        </Card>

        <Card title={t("cmdb.detail.governance")} icon={Building2}>
          <Row label={t("cmdb.detail.criticality")} value={
            <span className="inline-flex items-center gap-1.5 capitalize">
              <ShieldAlert className={`h-3.5 w-3.5 ${asset.criticality === "critical" ? "text-destructive" : asset.criticality === "high" ? "text-warning" : "text-muted-foreground"}`} />
              {asset.criticality}
            </span>
          } />
          <Row label={t("cmdb.detail.deptId")} value={asset.department_id ? <span className="font-mono text-[11px]">{asset.department_id.slice(0, 8)}…</span> : "—"} />
          <Row label={t("cmdb.detail.tags")} value={
            <div className="flex flex-wrap gap-1">
              {(asset.tags ?? []).length === 0 && "—"}
              {(asset.tags ?? []).map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground ring-1 ring-border">
                  <Tag className="h-2.5 w-2.5" />{tag}
                </span>
              ))}
            </div>
          } />
        </Card>
      </div>

      <div className="grid gap-4 px-6 py-6 lg:grid-cols-2">
        <Card title={t("cmdb.detail.dependsOn")} icon={GitBranch}>
          {upstream.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("cmdb.detail.none")}</p>
          ) : (
            <ul className="space-y-2">
              {upstream.map((d) => {
                const target = assetById(d.target_asset_id);
                return (
                  <li key={d.id}>
                    <Link to={`/cmdb/assets/${d.target_asset_id}`} className="flex items-center justify-between rounded-lg border border-border bg-background p-3 transition-all hover:border-primary/40 hover:-translate-y-0.5">
                      <div>
                        <p className="text-sm font-medium text-foreground">{target?.name ?? d.target_asset_id}</p>
                        <p className="text-xs text-muted-foreground">{target?.asset_type ?? ""}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary ring-1 ring-primary/20">
                        {d.dependency_type.replace("_", " ")}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title={t("cmdb.detail.usedBy")} icon={GitBranch}>
          {downstream.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("cmdb.detail.none")}</p>
          ) : (
            <ul className="space-y-2">
              {downstream.map((d) => {
                const src = assetById(d.source_asset_id);
                return (
                  <li key={d.id}>
                    <Link to={`/cmdb/assets/${d.source_asset_id}`} className="flex items-center justify-between rounded-lg border border-border bg-background p-3 transition-all hover:border-primary/40 hover:-translate-y-0.5">
                      <div>
                        <p className="text-sm font-medium text-foreground">{src?.name ?? d.source_asset_id}</p>
                        <p className="text-xs text-muted-foreground">{src?.asset_type ?? ""}</p>
                      </div>
                      <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning ring-1 ring-warning/20">
                        {d.dependency_type.replace("_", " ")}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {asset.notes && (
        <div className="px-6 pb-8">
          <Card title={t("cmdb.detail.notes")} icon={Tag}>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{asset.notes}</p>
          </Card>
        </div>
      )}
    </div>
  );
};

const Card = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-border bg-card p-4">
    <header className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </header>
    <div className="space-y-2">{children}</div>
  </section>
);

const Row = ({ label, value }: { label: React.ReactNode; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-3 text-sm">
    <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
    <span className="text-right capitalize text-foreground">{value}</span>
  </div>
);

export default AssetDetail;
