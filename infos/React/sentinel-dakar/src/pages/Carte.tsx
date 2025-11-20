import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { type LatLngExpression, type LatLngTuple } from "leaflet";
import type { Map as LeafletMap } from 'leaflet';
import type { Marker as LeafletMarker } from 'leaflet';
type LatLng = [number, number];
import 'leaflet/dist/leaflet.css';
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useApi } from "../hooks/useApi";
import { useRealtime } from "@/hooks/useRealtime";
import { Map as MapIcon, Search, Layers, Navigation, MapPin, AlertTriangle, Filter, Maximize2 } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useGeolocation } from "@/hooks/useGeolocation.tsx";

// Fix Leaflet icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const riskZones = [
  { id: 1, name: "Guédiawaye", level: "critical", coords: [14.7750, -17.4050], population: 45000, lastUpdate: "Il y a 2 min" },
  { id: 2, name: "Pikine", level: "high", coords: [14.7550, -17.3750], population: 35000, lastUpdate: "Il y a 5 min" },
  { id: 3, name: "Yeumbeul", level: "medium", coords: [14.7950, -17.3850], population: 28000, lastUpdate: "Il y a 12 min" },
  { id: 4, name: "Médina", level: "low", coords: [14.6800, -17.4350], population: 15000, lastUpdate: "Il y a 20 min" },
];

const levelConfig = {
  critical: { color: "bg-destructive", text: "Critique" },
  high: { color: "bg-danger", text: "Élevé" },
  medium: { color: "bg-warning", text: "Moyen" },
  low: { color: "bg-success", text: "Faible" },
};

const Carte = () => {
  const AnyMapContainer: any = MapContainer;
  const AnyMarker: any = Marker;
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [filters, setFilters] = useState({
    critical: true,
    high: true,
    medium: true,
    low: true,
  });
  const [fullscreen, setFullscreen] = useState(false);
  const { t } = useTranslation();
  const { position } = useGeolocation();
  const [searchText, setSearchText] = useState("");

  // Données réelles
  const { data: alertsData } = useApi("alertes");
  const { data: reportsData } = useApi("signalements");
  useRealtime("http://127.0.0.1:8000/api/realtime/stream");

  // Helpers pour extraire lat/lng depuis les objets backend
  const getLatLng = (o: any): LatLng | null => {
    const loc = o?.location || o?.localisation || {};
    const lat = Number(loc.lat || loc.latitude || o?.lat || o?.latitude);
    const lng = Number(loc.lng || loc.long || loc.lon || loc.longitude || o?.lng || o?.long || o?.lon || o?.longitude);
    if (isFinite(lat) && isFinite(lng)) return [lat, lng] as LatLng;
    return null;
  };

  const alerts = Array.isArray(alertsData) ? alertsData : [];
  const reports = Array.isArray(reportsData) ? reportsData : [];
  const initialCenter: LatLngExpression = [(position?.latitude ?? 14.7167), (position?.longitude ?? -17.4677)] as LatLngTuple;

  // Focus sur une zone
  const focusZone = (coords: [number, number] | number[]) => {
    if (map) {
      map.setView(coords as LatLngTuple, 14, { animate: true });
    }
  };

  // Recherche: par nom de zone ou coordonnées "lat, lng"
  const handleSearch = () => {
    const q = (searchText || "").trim();
    if (!q) return;
    // Essayer de parser des coordonnées
    const m = q.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (m) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      if (isFinite(lat) && isFinite(lng)) {
        focusZone([lat, lng]);
        return;
      }
    }
    // Rechercher par nom de zone connu
    const lower = q.toLowerCase();
    const foundRisk = riskZones.find(z => z.name.toLowerCase().includes(lower));
    if (foundRisk) {
      focusZone(foundRisk.coords);
      return;
    }
    // Chercher dans alertes / signalements (localisation.nom ou location_text)
    const findLatLngByLabel = (arr: any[]) => {
      for (const a of arr) {
        const label = String(a?.localisation?.nom || a?.location_text || a?.location || "").toLowerCase();
        if (label && label.includes(lower)) {
          const p = getLatLng(a);
          if (p) return p;
        }
      }
      return null;
    };
    const p1 = Array.isArray(alertsData) ? findLatLngByLabel(alertsData as any[]) : null;
    const p2 = p1 || (Array.isArray(reportsData) ? findLatLngByLabel(reportsData as any[]) : null);
    if (p2) {
      focusZone(p2 as any);
    }
  };

  // Centrer sur position en temps réel
  useEffect(() => {
    if (map && position) {
      map.setView([position.latitude, position.longitude] as LatLngTuple, 13, { animate: true });
    }
  }, [map, position]);

  // Fit bounds sur les marqueurs visibles
  useEffect(() => {
    if (!map) return;
    const positions: LatLngTuple[] = [];
    const push = (p: LatLng | null) => { if (p) positions.push(p as LatLngTuple); };
    (Array.isArray(alertsData)? alertsData: []).forEach((a: any) => {
      const pos = getLatLng(a);
      const levelRaw = String(a.level || a.niveau || 'info').toLowerCase();
      const level = levelRaw.includes('crit') ? 'critical' : levelRaw.includes('high') ? 'high' : levelRaw.includes('medium') ? 'medium' : 'low';
      if (filters[level as keyof typeof filters]) push(pos);
    });
    (Array.isArray(reportsData)? reportsData: []).forEach((r: any) => push(getLatLng(r)));
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds.pad(0.2));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, alertsData, reportsData, filters.critical, filters.high, filters.medium, filters.low]);

  // Toggle filtre
  const toggleFilter = (level: string) => {
    setFilters(prev => ({ ...prev, [level]: !prev[level] }));
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">{t('map.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('map.subtitle')}</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Layers className="h-4 w-4 mr-2" />
              {t('map.layers')}
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {t('map.filters')}
            </Button>
            <Button onClick={() => setFullscreen(!fullscreen)}>
              <Maximize2 className="h-4 w-4 mr-2" />
              {fullscreen ? t('map.exitFullscreen') : t('map.fullscreen')}
            </Button>
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 ${fullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('map.searchZone')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder={t('common.search')+"..."}
                    className="pl-10"
                    value={searchText}
                    onChange={(e)=>setSearchText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Filtres par niveau */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-primary" />
                  {t('map.levelFilters')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(levelConfig).map(([level, config]) => (
                  <div key={level} className="flex items-center space-x-2">
                    <input type="checkbox"
                      checked={filters[level as keyof typeof filters]}
                      onChange={() => toggleFilter(level)}
                    />
                    <div className={`w-4 h-4 rounded-full ${config.color}`} />
                    <span>{config.text}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Zones at Risk */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-danger" />
                  {t('map.zones')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(searchText ? riskZones.filter(z => z.name.toLowerCase().includes(searchText.toLowerCase())) : riskZones).map(zone => {
                  const config = levelConfig[zone.level];
                  return (
                    <div key={zone.id} className="p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{zone.name}</h4>
                        <Badge className={`${config.color} text-white`}>{config.text}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Population:</span>
                          <span>{zone.population.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Dernière MAJ:</span>
                          <span>{zone.lastUpdate}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => focusZone(zone.coords)}>
                        <MapPin className="h-3 w-3 mr-1" />
                        {t('map.locate')}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Map */}
          <div className="md:col-span-2 lg:col-span-3">
            <Card className="h-[80vh]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <MapIcon className="h-5 w-5 mr-2 text-primary" />
                    Carte de Dakar - Surveillance Temps Réel
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Navigation className="h-4 w-4" />
                    </Button>
                    <Badge variant="outline" className="bg-success/10 text-success">En ligne</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[72vh]">
                <AnyMapContainer
                  center={initialCenter as any}
                  zoom={12}
                  scrollWheelZoom
                  className="h-full w-full"
                  whenCreated={setMap}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {/* Marqueurs alertes géolocalisées */}
                  {alerts.map((a: any, idx: number) => {
                    const pos = getLatLng(a);
                    const levelRaw = String(a.level || a.niveau || 'info').toLowerCase();
                    const level = levelRaw.includes('crit') ? 'critical' : levelRaw.includes('high') ? 'high' : levelRaw.includes('medium') ? 'medium' : 'low';
                    if (!pos) return null;
                    if (!filters[level as keyof typeof filters]) return null;
                    const label = String((a?.localisation?.nom) || a?.location_text || '').trim();
                    const html = [
                      '<div style="display:flex;align-items:center;gap:4px;transform:translateY(-4px)">',
                      '<div style="color:#e11d48;font-size:18px;line-height:18px">▲</div>',
                      label ? `<div style="background:#fff;padding:2px 6px;border:1px solid #e5e7eb;border-radius:12px;font-size:11px;color:#111;box-shadow:0 1px 2px rgba(0,0,0,0.08)">${label}</div>` : '',
                      '</div>'
                    ].join('');
                    const icon = (a.has_signalement ? L.divIcon({ html, className: 'arrow-marker' }) : undefined);
                    const MarkerEl = icon
                      ? <AnyMarker key={`alert-${a.id || a.pk || idx}`} position={pos as LatLngTuple} icon={icon}>
                          <Popup>
                            <strong>{a.title || a.titre || 'Alerte'}</strong><br />
                            Niveau: {levelConfig[level as keyof typeof levelConfig].text}<br />
                            {a.location_text ? (<>
                              Lieu: {String(a.location_text)}<br />
                            </>) : null}
                            Date: {String(a.created_at || a.date || '').replace('T',' ').replace('Z','')}
                          </Popup>
                        </AnyMarker>
                      : <AnyMarker key={`alert-${a.id || a.pk || idx}`} position={pos as LatLngTuple}>
                          <Popup>
                            <strong>{a.title || a.titre || 'Alerte'}</strong><br />
                            Niveau: {levelConfig[level as keyof typeof levelConfig].text}<br />
                            {a.location_text ? (<>
                              Lieu: {String(a.location_text)}<br />
                            </>) : null}
                            Date: {String(a.created_at || a.date || '').replace('T',' ').replace('Z','')}
                          </Popup>
                        </AnyMarker>;
                    return MarkerEl;
                    
                  })}

                  {/* Marqueurs signalements (si géoloc disponibles) */}
                  {reports.map((r: any, idx: number) => {
                    const pos = getLatLng(r);
                    if (!pos) return null;
                    return (
                      <AnyMarker key={`rep-${r.id || r.pk || idx}`} position={pos as LatLngTuple}>
                        <Popup>
                          <strong>Signalement</strong><br />
                          {r.description ? (<>Desc: {String(r.description)}<br /></>) : null}
                          {r.location_text ? (<>Lieu: {String(r.location_text)}<br /></>) : null}
                          Date: {String(r.created_at || r.date || '').replace('T',' ').replace('Z','')}
                        </Popup>
                      </AnyMarker>
                    );
                  })}
                </AnyMapContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Carte;


