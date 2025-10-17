import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useApi } from "../hooks/useApi";
import { Map as MapIcon, Search, Layers, Navigation, MapPin, AlertTriangle, Filter, Maximize2 } from "lucide-react";

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
  const [map, setMap] = useState<L.Map | null>(null);
  const [filters, setFilters] = useState({
    critical: true,
    high: true,
    medium: true,
    low: true,
  });
  const [fullscreen, setFullscreen] = useState(false);

  // Focus sur une zone
  const focusZone = (coords: [number, number]) => {
    if (map) {
      map.setView(coords, 14, { animate: true });
    }
  };

  // Toggle filtre
  const toggleFilter = (level: string) => {
    setFilters(prev => ({ ...prev, [level]: !prev[level] }));
  };

  // Alertes temps réel simulées (désactivées)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const newZone = riskZones[Math.floor(Math.random() * riskZones.length)];
  //     if (newZone.level === "critical") {
  //       // notification simulée désactivée
  //     }
  //   }, 15000);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
              Carte Interactive des Risques
            </h1>
            <p className="text-muted-foreground mt-1">
              Visualisation en temps réel des zones à risque d'inondation
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Layers className="h-4 w-4 mr-2" />
              Couches
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            <Button onClick={() => setFullscreen(!fullscreen)}>
              <Maximize2 className="h-4 w-4 mr-2" />
              {fullscreen ? "Quitter plein écran" : "Plein écran"}
            </Button>
          </div>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${fullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
          {/* Sidebar */}
          <div className="space-y-4">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rechercher une zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Nom du quartier..." className="pl-10" />
                </div>
              </CardContent>
            </Card>

            {/* Filtres par niveau */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-primary" />
                  Filtres par niveau
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
                  Zones Surveillées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {riskZones.map(zone => {
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
                        Localiser
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Map */}
          <div className="lg:col-span-3">
            <Card className="h-[700px]">
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
              <CardContent className="p-0 h-[650px]">
                <MapContainer
                  center={[14.7167, -17.4677]}
                  zoom={12}
                  scrollWheelZoom
                  className="h-full w-full"
                  whenCreated={setMap}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {riskZones
                    .filter(zone => filters[zone.level as keyof typeof filters])
                    .map(zone => (
                      <Marker key={zone.id} position={zone.coords}>
                        <Popup>
                          <strong>{zone.name}</strong><br />
                          Niveau: {levelConfig[zone.level].text}<br />
                          Population: {zone.population.toLocaleString()}<br />
                          Dernière MAJ: {zone.lastUpdate}
                        </Popup>
                      </Marker>
                  ))}
                </MapContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Carte;
