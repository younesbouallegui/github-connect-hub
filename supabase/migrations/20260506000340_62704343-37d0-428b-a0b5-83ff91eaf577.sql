
-- ===== Enums =====
DO $$ BEGIN
  CREATE TYPE public.provider_kind AS ENUM ('zabbix','grafana','prometheus','datadog','jira','slack','teams','huawei_nms','custom');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.provider_status AS ENUM ('connected','disconnected','degraded','error','unconfigured');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.alert_severity AS ENUM ('info','warning','average','high','disaster','not_classified');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.alert_lifecycle AS ENUM ('open','acknowledged','assigned','escalated','resolved','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.sync_result AS ENUM ('ok','partial','error','running');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ===== monitoring_providers =====
CREATE TABLE IF NOT EXISTS public.monitoring_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind public.provider_kind NOT NULL,
  base_url text,
  status public.provider_status NOT NULL DEFAULT 'unconfigured',
  enabled boolean NOT NULL DEFAULT true,
  sync_interval_minutes int NOT NULL DEFAULT 5,
  last_sync_at timestamptz,
  last_error text,
  health_score int NOT NULL DEFAULT 0,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  /** Reference name of secret holding API token in edge function env */
  secret_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, name)
);

ALTER TABLE public.monitoring_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "providers_select_authed" ON public.monitoring_providers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "providers_admin_all" ON public.monitoring_providers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_providers_updated_at BEFORE UPDATE ON public.monitoring_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_providers_audit AFTER INSERT OR UPDATE OR DELETE ON public.monitoring_providers
  FOR EACH ROW EXECUTE FUNCTION public.write_audit();

-- ===== host groups =====
CREATE TABLE IF NOT EXISTS public.monitoring_host_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.monitoring_providers(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, external_id)
);
ALTER TABLE public.monitoring_host_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "host_groups_select_authed" ON public.monitoring_host_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "host_groups_admin_all" ON public.monitoring_host_groups FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));

-- ===== hosts =====
CREATE TABLE IF NOT EXISTS public.monitoring_hosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.monitoring_providers(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  name text NOT NULL,
  hostname text,
  ip_address text,
  available boolean,
  status text,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  last_seen timestamptz,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, external_id)
);
ALTER TABLE public.monitoring_hosts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hosts_select_authed" ON public.monitoring_hosts FOR SELECT TO authenticated USING (true);
CREATE POLICY "hosts_admin_all" ON public.monitoring_hosts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_hosts_updated_at BEFORE UPDATE ON public.monitoring_hosts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_hosts_provider ON public.monitoring_hosts(provider_id);
CREATE INDEX IF NOT EXISTS idx_hosts_asset ON public.monitoring_hosts(asset_id);

-- ===== alerts =====
CREATE TABLE IF NOT EXISTS public.monitoring_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.monitoring_providers(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  host_id uuid REFERENCES public.monitoring_hosts(id) ON DELETE SET NULL,
  asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.business_services(id) ON DELETE SET NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  severity public.alert_severity NOT NULL DEFAULT 'warning',
  status public.alert_lifecycle NOT NULL DEFAULT 'open',
  title text NOT NULL,
  description text,
  triggered_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  acknowledged_by uuid,
  assigned_to uuid,
  resolved_at timestamptz,
  resolution_notes text,
  root_cause text,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, external_id)
);
ALTER TABLE public.monitoring_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_select_authed" ON public.monitoring_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "alerts_admin_all" ON public.monitoring_alerts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "alerts_operator_update" ON public.monitoring_alerts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'operator'))
  WITH CHECK (public.has_role(auth.uid(),'operator'));
CREATE TRIGGER trg_alerts_updated_at BEFORE UPDATE ON public.monitoring_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.monitoring_alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.monitoring_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered ON public.monitoring_alerts(triggered_at DESC);

-- ===== metrics =====
CREATE TABLE IF NOT EXISTS public.monitoring_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.monitoring_providers(id) ON DELETE CASCADE,
  host_id uuid REFERENCES public.monitoring_hosts(id) ON DELETE CASCADE,
  external_id text,
  key text NOT NULL,
  unit text,
  value numeric,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  raw jsonb
);
ALTER TABLE public.monitoring_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "metrics_select_authed" ON public.monitoring_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "metrics_admin_all" ON public.monitoring_metrics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_metrics_host_key_time ON public.monitoring_metrics(host_id, key, recorded_at DESC);

-- ===== events =====
CREATE TABLE IF NOT EXISTS public.monitoring_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.monitoring_providers(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  host_id uuid REFERENCES public.monitoring_hosts(id) ON DELETE SET NULL,
  alert_id uuid REFERENCES public.monitoring_alerts(id) ON DELETE SET NULL,
  event_type text,
  severity public.alert_severity,
  message text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  raw jsonb,
  UNIQUE (provider_id, external_id)
);
ALTER TABLE public.monitoring_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_select_authed" ON public.monitoring_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "events_admin_all" ON public.monitoring_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));

-- ===== maps =====
CREATE TABLE IF NOT EXISTS public.monitoring_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.monitoring_providers(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  name text NOT NULL,
  layout jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, external_id)
);
ALTER TABLE public.monitoring_maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maps_select_authed" ON public.monitoring_maps FOR SELECT TO authenticated USING (true);
CREATE POLICY "maps_admin_all" ON public.monitoring_maps FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));

-- ===== sync logs =====
CREATE TABLE IF NOT EXISTS public.monitoring_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.monitoring_providers(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  result public.sync_result NOT NULL DEFAULT 'running',
  records_ingested int NOT NULL DEFAULT 0,
  duration_ms int,
  message text,
  details jsonb
);
ALTER TABLE public.monitoring_sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sync_logs_admin_select" ON public.monitoring_sync_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'auditor'));
CREATE INDEX IF NOT EXISTS idx_sync_logs_provider ON public.monitoring_sync_logs(provider_id, started_at DESC);

-- ===== provider health =====
CREATE TABLE IF NOT EXISTS public.provider_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.monitoring_providers(id) ON DELETE CASCADE,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  health_score int NOT NULL,
  latency_ms int,
  status public.provider_status NOT NULL,
  message text
);
ALTER TABLE public.provider_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "provider_health_select_authed" ON public.provider_health FOR SELECT TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_provider_health_time ON public.provider_health(provider_id, recorded_at DESC);

-- ===== Auto super_admin bootstrap for the platform owner =====
CREATE OR REPLACE FUNCTION public.bootstrap_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'boualleguimoetaz@gmail.com' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'super_admin')
    ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_bootstrap_super_admin ON auth.users;
CREATE TRIGGER trg_bootstrap_super_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.bootstrap_super_admin();

-- Promote if already exists
INSERT INTO public.user_roles(user_id, role)
SELECT id, 'super_admin' FROM auth.users WHERE email = 'boualleguimoetaz@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles(user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'boualleguimoetaz@gmail.com'
ON CONFLICT DO NOTHING;
