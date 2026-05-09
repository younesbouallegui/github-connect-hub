import type {
  MonitoringHost,
  MonitoringHostGroup,
  MonitoringProvider,
  MonitoringDashboard,
  MetricKind,
  VizKind,
} from "@/types/monitoring";

export const PROVIDERS: MonitoringProvider[] = [
  { id: "p-zbx", name: "Zabbix Production", kind: "zabbix", status: "connected", lastSyncAt: new Date().toISOString() },
  { id: "p-prom", name: "Prometheus Cluster", kind: "prometheus", status: "connected", lastSyncAt: new Date().toISOString() },
  { id: "p-dd", name: "Datadog Corp", kind: "datadog", status: "degraded" },
];

export const HOST_GROUPS: MonitoringHostGroup[] = [
  { id: "g-linux", name: "Linux Servers", department: "IT Infra" },
  { id: "g-db", name: "Database Cluster", department: "Data" },
  { id: "g-net", name: "Network Switches", department: "Network" },
  { id: "g-k8s", name: "Kubernetes Prod", department: "Platform" },
  { id: "g-erp", name: "ERP Application", department: "Apps" },
];

const mkHost = (
  id: string,
  name: string,
  groupId: string,
  status: MonitoringHost["status"] = "ok",
  dept = "IT Infra",
): MonitoringHost => ({
  id, name, groupId, providerId: "p-zbx", department: dept, status,
  fqdn: `${name}.poulina.local`, tags: [groupId.replace("g-", "")],
});

export const HOSTS: MonitoringHost[] = [
  mkHost("h-lnx-01", "linux-server-01", "g-linux"),
  mkHost("h-lnx-02", "linux-server-02", "g-linux", "warning"),
  mkHost("h-db-01", "db-master-01", "g-db", "ok", "Data"),
  mkHost("h-db-02", "db-replica-02", "g-db", "critical", "Data"),
  mkHost("h-net-01", "core-switch-01", "g-net", "ok", "Network"),
  mkHost("h-net-02", "edge-switch-02", "g-net", "warning", "Network"),
  mkHost("h-k8s-01", "k8s-master-01", "g-k8s", "ok", "Platform"),
  mkHost("h-k8s-02", "k8s-worker-04", "g-k8s", "warning", "Platform"),
  mkHost("h-erp-01", "erp-app-01", "g-erp", "ok", "Apps"),
];

export const DEPARTMENTS = ["IT Infra", "Data", "Network", "Platform", "Apps", "Security"];
export const BUSINESS_SERVICES = ["ERP", "E-commerce", "Customer Portal", "Internal Billing", "HR Suite"];

export const METRIC_LIBRARY: { kind: MetricKind; label: string; unit: string; icon: string }[] = [
  { kind: "cpu", label: "CPU usage", unit: "%", icon: "cpu" },
  { kind: "memory", label: "Memory", unit: "%", icon: "memorystick" },
  { kind: "disk", label: "Disk / Storage", unit: "%", icon: "harddrive" },
  { kind: "network_in", label: "Network In", unit: "Mbps", icon: "arrowdown" },
  { kind: "network_out", label: "Network Out", unit: "Mbps", icon: "arrowup" },
  { kind: "packet_loss", label: "Packet loss", unit: "%", icon: "wifi" },
  { kind: "ping", label: "Ping latency", unit: "ms", icon: "radio" },
  { kind: "availability", label: "Availability", unit: "%", icon: "activity" },
  { kind: "uptime", label: "Uptime", unit: "days", icon: "clock" },
  { kind: "error_rate", label: "Error rate", unit: "%", icon: "alerttriangle" },
  { kind: "temperature", label: "Temperature", unit: "°C", icon: "thermometer" },
  { kind: "trigger_count", label: "Trigger count", unit: "", icon: "zap" },
  { kind: "alert_count", label: "Alert count", unit: "", icon: "bell" },
  { kind: "sla", label: "SLA", unit: "%", icon: "gauge" },
  { kind: "capacity", label: "Capacity", unit: "%", icon: "database" },
];

export const VIZ_LIBRARY: { kind: VizKind; label: string; icon: string; group: string }[] = [
  { kind: "line", label: "Line graph", icon: "linechart", group: "Time series" },
  { kind: "area", label: "Area graph", icon: "activity", group: "Time series" },
  { kind: "stacked_area", label: "Stacked area", icon: "layers", group: "Time series" },
  { kind: "bar", label: "Bar chart", icon: "barchart3", group: "Categorical" },
  { kind: "pie", label: "Pie", icon: "piechart", group: "Categorical" },
  { kind: "donut", label: "Donut", icon: "circle", group: "Categorical" },
  { kind: "gauge", label: "Gauge", icon: "gauge", group: "Single value" },
  { kind: "stat", label: "Status card", icon: "hash", group: "Single value" },
  { kind: "sla_meter", label: "SLA meter", icon: "shield", group: "Single value" },
  { kind: "heatmap", label: "Heatmap", icon: "grid3x3", group: "Distribution" },
  { kind: "table", label: "Table", icon: "table", group: "Tabular" },
  { kind: "topology", label: "Topology", icon: "network", group: "Map" },
  { kind: "alert_stream", label: "Alert stream", icon: "bell", group: "Streams" },
  { kind: "timeline", label: "Timeline", icon: "clock", group: "Streams" },
];

const now = new Date().toISOString();

export const STARTER_DASHBOARDS: MonitoringDashboard[] = [
  {
    id: "dash-exec",
    name: "Executive Operations",
    description: "C-level overview — global health, SLA and incidents.",
    category: "executive",
    updatedAt: now,
    tags: ["executive", "global"],
    panels: [
      { id: "p1", title: "Global health score", viz: "gauge", scope: { kind: "business_service", ids: ["ERP"] }, query: { metric: "availability" }, config: { timeRange: "24h", refreshIntervalSec: 60, thresholds: [{ value: 95, color: "warning" }, { value: 99, color: "ok" }] }, x: 0, y: 0, w: 6, h: 6 },
      { id: "p2", title: "Active alerts", viz: "stat", scope: { kind: "provider", ids: ["p-zbx"] }, query: { metric: "alert_count" }, config: { timeRange: "1h", refreshIntervalSec: 30, thresholds: [] }, x: 6, y: 0, w: 6, h: 3 },
      { id: "p3", title: "SLA compliance", viz: "sla_meter", scope: { kind: "department", ids: ["IT Infra"] }, query: { metric: "sla" }, config: { timeRange: "30d", refreshIntervalSec: 300, thresholds: [{ value: 99, color: "ok" }] }, x: 12, y: 0, w: 6, h: 3 },
      { id: "p4", title: "CPU — Linux fleet", viz: "line", scope: { kind: "host_group", ids: ["g-linux"] }, query: { metric: "cpu", multiHost: true }, config: { timeRange: "6h", refreshIntervalSec: 30, thresholds: [{ value: 80, color: "warning" }, { value: 95, color: "critical" }] }, x: 6, y: 3, w: 12, h: 6 },
      { id: "p5", title: "Alert stream", viz: "alert_stream", scope: { kind: "provider", ids: ["p-zbx"] }, query: { metric: "alert_count" }, config: { timeRange: "1h", refreshIntervalSec: 15, thresholds: [] }, x: 0, y: 6, w: 6, h: 6 },
    ],
  },
  {
    id: "dash-noc",
    name: "NOC Wallboard",
    description: "Network operations center — real-time infrastructure status.",
    category: "noc",
    updatedAt: now,
    tags: ["noc", "wallboard"],
    panels: [
      { id: "n1", title: "Network throughput", viz: "stacked_area", scope: { kind: "host_group", ids: ["g-net"] }, query: { metric: "network_in", multiHost: true }, config: { timeRange: "1h", refreshIntervalSec: 15, thresholds: [] }, x: 0, y: 0, w: 12, h: 6 },
      { id: "n2", title: "Packet loss", viz: "heatmap", scope: { kind: "host_group", ids: ["g-net"] }, query: { metric: "packet_loss" }, config: { timeRange: "6h", refreshIntervalSec: 30, thresholds: [] }, x: 12, y: 0, w: 6, h: 6 },
      { id: "n3", title: "DB cluster status", viz: "table", scope: { kind: "host_group", ids: ["g-db"] }, query: { metric: "availability" }, config: { timeRange: "5m", refreshIntervalSec: 10, thresholds: [] }, x: 0, y: 6, w: 9, h: 5 },
      { id: "n4", title: "Severity breakdown", viz: "donut", scope: { kind: "provider", ids: ["p-zbx"] }, query: { metric: "alert_count" }, config: { timeRange: "24h", refreshIntervalSec: 30, thresholds: [] }, x: 9, y: 6, w: 9, h: 5 },
    ],
  },
];
