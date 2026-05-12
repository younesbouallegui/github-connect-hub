import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { PageHeader } from "@/components/layout/PageHeader";
import { hostCoords, severityColor, severityTier, useZabbixHosts, useZabbixProblems } from "@/lib/zabbix";
import { Loader2 } from "lucide-react";

const Maps = () => {
  const { data: hosts = [], isLoading } = useZabbixHosts();
  const { data: problems = [] } = useZabbixProblems();

  const points = useMemo(() => {
    // Worst-severity problem per host
    const sevByHost = new Map<string, number>();
    for (const p of problems) {
      const hid = p.hosts?.[0]?.hostid;
      if (!hid) continue;
      const n = parseInt(p.severity, 10) || 0;
      sevByHost.set(hid, Math.max(sevByHost.get(hid) ?? 0, n));
    }
    return hosts
      .map((h) => {
        const c = hostCoords(h);
        if (!c) return null;
        const sev = sevByHost.get(h.hostid) ?? 0;
        return { host: h, ...c, sev, tier: severityTier(sev) };
      })
      .filter(Boolean) as Array<{ host: typeof hosts[number]; lat: number; lon: number; sev: number; tier: string }>;
  }, [hosts, problems]);

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title="Global Map"
        subtitle={`${points.length} of ${hosts.length} hosts geolocated`}
      />
      <div className="relative flex-1 p-4">
        {isLoading ? (
          <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="h-[calc(100vh-12rem)] overflow-hidden rounded-xl border border-border">
            <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Streets">
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satellite">
                  <TileLayer attribution='Tiles &copy; Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                </LayersControl.BaseLayer>
              </LayersControl>
              {points.map(({ host, lat, lon, sev, tier }) => (
                <CircleMarker
                  key={host.hostid}
                  center={[lat, lon]}
                  radius={8 + (sev || 0)}
                  pathOptions={{ color: severityColor(sev), fillColor: severityColor(sev), fillOpacity: 0.7, weight: 2 }}
                >
                  <Popup>
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold">{host.name}</p>
                      <p className="text-muted-foreground">{host.host}</p>
                      <p>Severity: <span className="font-semibold capitalize">{tier}</span></p>
                      <p>{lat.toFixed(2)}, {lon.toFixed(2)}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Maps;
