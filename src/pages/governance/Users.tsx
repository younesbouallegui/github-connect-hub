import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { useI18n } from "@/contexts/I18nContext";
import { useToast } from "@/hooks/use-toast";
import { Users as UsersIcon, Loader2, Shield } from "lucide-react";
import type { Database as DB } from "@/integrations/supabase/types";

type Profile = DB["public"]["Tables"]["profiles"]["Row"];
type RoleRow = DB["public"]["Tables"]["user_roles"]["Row"];
type Role = "admin" | "operator" | "auditor" | "viewer";
const ALL_ROLES: Role[] = ["admin", "operator", "auditor", "viewer"];

const ROLE_BADGE: Record<Role, string> = {
  admin: "bg-destructive/15 text-destructive ring-destructive/30",
  operator: "bg-warning/15 text-warning ring-warning/30",
  auditor: "bg-primary/15 text-primary ring-primary/30",
  viewer: "bg-muted text-muted-foreground ring-border",
};

const Users = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    const [p, r] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);
    setProfiles(p.data ?? []);
    setRoles(r.data ?? []);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const rolesByUser = useMemo(() => {
    const out: Record<string, Role[]> = {};
    for (const r of roles) (out[r.user_id] ??= []).push(r.role as Role);
    return out;
  }, [roles]);

  const toggleRole = async (userId: string, role: Role) => {
    setSavingId(userId);
    const has = rolesByUser[userId]?.includes(role);
    if (has) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) toast({ title: t("gov.users.failed"), description: error.message, variant: "destructive" });
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) toast({ title: t("gov.users.failed"), description: error.message, variant: "destructive" });
    }
    await load();
    setSavingId(null);
  };

  return (
    <div className="flex flex-col">
      <PageHeader title={t("gov.users.title")} subtitle={t("gov.users.subtitle")} icon={UsersIcon} />

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : profiles.length === 0 ? (
        <div className="mx-6 mb-8 rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {t("gov.users.empty")}
        </div>
      ) : (
        <div className="overflow-hidden mx-6 mb-8 rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("gov.users.col.user")}</th>
                <th className="px-4 py-3">{t("gov.users.col.email")}</th>
                <th className="px-4 py-3">{t("gov.users.col.roles")}</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => {
                const userRoles = rolesByUser[p.user_id] ?? [];
                const isSaving = savingId === p.user_id;
                return (
                  <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/20">
                          {(p.full_name ?? p.email).split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{p.full_name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{userRoles.length} {t("gov.users.rolesLower")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {ALL_ROLES.map((r) => {
                          const active = userRoles.includes(r);
                          return (
                            <button
                              key={r}
                              disabled={isSaving}
                              onClick={() => toggleRole(p.user_id, r)}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 transition-all ${
                                active ? ROLE_BADGE[r] : "bg-background text-muted-foreground ring-border opacity-50 hover:opacity-100"
                              } disabled:cursor-not-allowed`}
                            >
                              <Shield className="h-3 w-3" />{r}
                            </button>
                          );
                        })}
                        {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
