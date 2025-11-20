import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Map, Maximize2, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const riskZones = [
  { name: "Pikine", level: "high", coords: [14.7550, -17.3750] },
  { name: "Guédiawaye", level: "critical", coords: [14.7750, -17.4050] },
  { name: "Yeumbeul", level: "medium", coords: [14.7950, -17.3850] },
  { name: "Médina", level: "low", coords: [14.6800, -17.4350] },
] as const;

const levelColors = {
  low: "bg-success",
  medium: "bg-warning", 
  high: "bg-danger",
  critical: "bg-destructive",
} as const;

const pinColor = (level: string) =>
  level === "critical" ? "#ef4444" : level === "high" ? "#f97316" : level === "medium" ? "#f59e0b" : "#22c55e";

function ensureLeafletLoaded(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).L) {
      resolve();
      return;
    }
    // CSS
    const existingCss = document.getElementById("leaflet-css") as HTMLLinkElement | null;
    if (!existingCss) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    // JS
    const existingScript = document.getElementById("leaflet-js") as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => reject(new Error("Leaflet load error")));
      return;
    }
    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Leaflet load error"));
    document.body.appendChild(script);
  });
}

export function MapPreview() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  const initMap = () => {
    const L = (window as any).L;
    if (!mapRef.current || !L) return;
    if (mapInstanceRef.current) {
      try { mapInstanceRef.current.remove(); } catch {}
      mapInstanceRef.current = null;
    }
    const center: [number, number] = [14.7167, -17.4677]; // Dakar
    const map = L.map(mapRef.current, { zoomControl: true }).setView(center, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const markers: any[] = [];
    const latlngs: [number, number][] = [];
    for (const z of riskZones) {
      const latlng = [z.coords[0], z.coords[1]] as [number, number];
      latlngs.push(latlng);
      const marker = L.circleMarker(latlng, {
        radius: 8,
        color: pinColor(z.level),
        fillColor: pinColor(z.level),
        fillOpacity: 0.8,
        weight: 2,
      }).addTo(map);
      marker.bindTooltip(`${z.name} - ${z.level.toUpperCase()}`, { permanent: false });
      markers.push(marker);
    }
    if (latlngs.length) {
      try { map.fitBounds(latlngs as any, { padding: [20, 20] }); } catch {}
    }
    mapInstanceRef.current = map;
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureLeafletLoaded();
        if (!cancelled) initMap();
      } catch {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const recenter = () => {
    const L = (window as any).L;
    if (!L || !mapInstanceRef.current) return;
    const latlngs = riskZones.map(z => [z.coords[0], z.coords[1]] as [number, number]);
    try { mapInstanceRef.current.fitBounds(latlngs as any, { padding: [20, 20] }); } catch {}
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
          <Map className="h-5 w-5 text-primary" />
          <span>Zones à Risque - Dakar</span>
        </CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={recenter} title="Recentrer">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open('https://www.openstreetmap.org/#map=12/14.7167/-17.4677', '_blank')}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="relative h-80 md:h-[28rem] rounded-lg overflow-hidden border">
          <div ref={mapRef} className="absolute inset-0" />
          {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm font-medium bg-black/30 text-white rounded-lg px-3 py-1">
                Chargement de la carte...
            </p>
          </div>
          )}
        </div>

        {/* Zone list */}
        <div className="space-y-2">
          <h4 className="text-sm md:text-base font-medium text-muted-foreground">
            Alertes par zone:
          </h4>
          {riskZones.map((zone) => (
            <div key={zone.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <span className="text-sm md:text-base font-medium">{zone.name}</span>
              <Badge 
                className={`${levelColors[zone.level]} text-white`}
              >
                {zone.level.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>

        <Button className="w-full" size="sm" variant="default" onClick={() => window.open('https://www.openstreetmap.org/#map=12/14.7167/-17.4677', '_blank')}>
          Voir la carte complète
        </Button>
      </CardContent>
    </Card>
  );
}