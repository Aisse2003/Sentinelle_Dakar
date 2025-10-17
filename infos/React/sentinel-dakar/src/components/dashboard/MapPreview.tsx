import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Map, Maximize2, RefreshCw } from "lucide-react";

const riskZones = [
  { name: "Pikine", level: "high", coords: [14.7550, -17.3750] },
  { name: "Guédiawaye", level: "critical", coords: [14.7750, -17.4050] },
  { name: "Yeumbeul", level: "medium", coords: [14.7950, -17.3850] },
  { name: "Médina", level: "low", coords: [14.6800, -17.4350] },
];

const levelColors = {
  low: "bg-success",
  medium: "bg-warning", 
  high: "bg-danger",
  critical: "bg-destructive",
};

export function MapPreview() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Map className="h-5 w-5 text-primary" />
          <span>Zones à Risque - Dakar</span>
        </CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Map placeholder with gradient background */}
        <div className="relative h-64 rounded-lg overflow-hidden mb-4 gradient-ocean">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40">
            {/* Simulated map markers */}
            {riskZones.map((zone, index) => (
              <div
                key={zone.name}
                className={`absolute w-4 h-4 rounded-full animate-pulse-glow`}
                style={{
                  left: `${20 + index * 20}%`,
                  top: `${30 + (index % 2) * 20}%`,
                  backgroundColor: `hsl(var(--${zone.level === 'critical' ? 'destructive' : 
                    zone.level === 'high' ? 'danger' : 
                    zone.level === 'medium' ? 'warning' : 'success'}))`
                }}
              />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-primary-foreground text-sm font-medium bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1">
              Carte interactive en cours de chargement...
            </p>
          </div>
        </div>

        {/* Zone list */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Alertes par zone:
          </h4>
          {riskZones.map((zone) => (
            <div key={zone.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">{zone.name}</span>
              <Badge 
                className={`${levelColors[zone.level]} text-white`}
              >
                {zone.level.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>

        <Button className="w-full mt-4" variant="default">
          Voir la carte complète
        </Button>
      </CardContent>
    </Card>
  );
}