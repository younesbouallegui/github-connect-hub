// Enterprise monitoring data model.
// These types mirror the database schema that backs the dashboard system.
// They are also used by the in-app builder to reason about scopes, metrics,
// visualizations and panel configuration.

export type ProviderKind =
  | "zabbix"
  | "prometheus"
  | "datadog"
  | "grafana"
  | "cloudwatch"
  | "azure_monitor"
  | "internal";

export interface MonitoringProvider {
  id: string;
  name: string;
  kind: ProviderKind;
  baseUrl?: string;
  status: "connected" | "degraded" | "disconnected";
  lastSyncAt?: string;
}

export interface MonitoringHostGroup {
  id: string;
  name: string;
  department?: string;
  description?: string;
}

export interface MonitoringHost {
  id: string;
  name: string;
  fqdn?: string;
  ip?: string;
  groupId: string;
  providerId: string;
  department?: string;
  tags?: string[];
  status: "ok" | "warning" | "critical" | "unknown";
}

export type MetricKind =
  | "cpu"
  | "memory"
  | "disk"
  | "network_in"
  | "network_out"
  | "packet_loss"
  | "ping"
  | "availability"
  | "uptime"
  | "error_rate"
  | "temperature"
  | "trigger_count"
  | "alert_count"
  | "sla"
  | "capacity";

export interface MonitoringMetric {
  id: string;
  hostId: string;
  kind: MetricKind;
  unit: string;
  lastValue: number;
  ts: string;
}

export type AlertSeverity = "info" | "warning" | "high" | "critical" | "disaster";

export interface MonitoringAlert {
  id: string;
  hostId: string;
  metricKind: MetricKind;
  severity: AlertSeverity;
  status: "open" | "ack" | "resolved";
  message: string;
  ts: string;
}

export type ScopeKind =
  | "host"
  | "host_group"
  | "department"
  | "asset"
  | "business_service"
  | "provider";

export interface PanelScope {
  kind: ScopeKind;
  ids: string[]; // one or more depending on multi-host compare
}

export type VizKind =
  | "line"
  | "area"
  | "stacked_area"
  | "bar"
  | "pie"
  | "donut"
  | "gauge"
  | "heatmap"
  | "sla_meter"
  | "stat"
  | "table"
  | "topology"
  | "alert_stream"
  | "timeline";

export interface PanelThreshold {
  value: number;
  color: "ok" | "info" | "warning" | "critical";
  label?: string;
}

export interface PanelQuery {
  metric: MetricKind;
  agg?: "avg" | "max" | "min" | "sum" | "p95" | "p99";
  filters?: Record<string, string>;
  multiHost?: boolean;
  forecast?: boolean;
}

export interface PanelConfig {
  timeRange: "5m" | "15m" | "1h" | "6h" | "24h" | "7d" | "30d";
  refreshIntervalSec: number;
  thresholds: PanelThreshold[];
  severityColors?: boolean;
}

export interface DashboardPanel {
  id: string;
  title: string;
  viz: VizKind;
  scope: PanelScope;
  query: PanelQuery;
  config: PanelConfig;
  // grid position (24-col grid)
  x: number;
  y: number;
  w: number;
  h: number;
}

export type DashboardCategory =
  | "executive"
  | "noc"
  | "department"
  | "personal"
  | "team"
  | "template";

export interface MonitoringDashboard {
  id: string;
  name: string;
  description?: string;
  category: DashboardCategory;
  ownerId?: string;
  tags?: string[];
  panels: DashboardPanel[];
  updatedAt: string;
}
