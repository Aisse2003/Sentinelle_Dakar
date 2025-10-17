import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useApi } from "../hooks/useApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  History, 
  Calendar, 
  MapPin, 
  TrendingUp,
  Download,
  Filter,
  Search,
  BarChart3,
  Clock
} from "lucide-react";

const historicalEvents = [
  {
    id: 1,
    date: "2024-08-15",
    title: "Inondations majeures de Août",
    locations: ["Guédiawaye", "Pikine", "Yeumbeul"],
    duration: "6 heures",
    affected: 25000,
    rainfall: "85mm",
    severity: "critical",
    description: "Fortes précipitations causant des inondations importantes dans plusieurs quartiers."
  },
  {
    id: 2,
    date: "2024-07-22",
    title: "Épisode pluvieux modéré",
    locations: ["Médina", "Plateau"],
    duration: "3 heures",
    affected: 8500,
    rainfall: "45mm",
    severity: "medium",
    description: "Accumulation d'eau sur les axes routiers principaux."
  },
  {
    id: 3,
    date: "2024-06-10",
    title: "Inondations secteur Nord",
    locations: ["Parcelles Assainies", "Grand Yoff"],
    duration: "4 heures",
    affected: 12000,
    rainfall: "62mm",
    severity: "high",
    description: "Débordement du canal de drainage principal."
  }
];

const monthlyStats = [
  { month: "Janvier", events: 2, totalRain: "15mm", avgDuration: "2h" },
  { month: "Février", events: 1, totalRain: "8mm", avgDuration: "1h" },
  { month: "Mars", events: 0, totalRain: "0mm", avgDuration: "-" },
  { month: "Avril", events: 1, totalRain: "25mm", avgDuration: "3h" },
  { month: "Mai", events: 3, totalRain: "78mm", avgDuration: "4h" },
  { month: "Juin", events: 4, totalRain: "125mm", avgDuration: "3h" },
  { month: "Juillet", events: 6, totalRain: "180mm", avgDuration: "4h" },
  { month: "Août", events: 8, totalRain: "220mm", avgDuration: "5h" },
];

const zoneStats = [
  { zone: "Guédiawaye", events: 12, lastEvent: "2024-08-15", riskLevel: "critical" },
  { zone: "Pikine", events: 10, lastEvent: "2024-08-15", riskLevel: "high" },
  { zone: "Yeumbeul", events: 8, lastEvent: "2024-07-30", riskLevel: "high" },
  { zone: "Médina", events: 5, lastEvent: "2024-07-22", riskLevel: "medium" },
  { zone: "Plateau", events: 3, lastEvent: "2024-06-18", riskLevel: "low" },
  { zone: "Almadies", events: 1, lastEvent: "2024-05-12", riskLevel: "low" },
];

const severityConfig = {
  critical: { color: "bg-destructive", text: "Critique" },
  high: { color: "bg-danger", text: "Élevé" },
  medium: { color: "bg-warning", text: "Moyen" },
  low: { color: "bg-success", text: "Faible" }
};

const Historique = () => {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
              Historique des Inondations
            </h1>
            <p className="text-muted-foreground mt-1">
              Données historiques et analyse des tendances pour Dakar
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gradient-ocean text-primary-foreground">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Événements 2024</p>
                  <p className="text-2xl font-bold">35</p>
                </div>
                <History className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Personnes Affectées</p>
                  <p className="text-2xl font-bold text-foreground">156K</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Durée Moyenne</p>
                  <p className="text-2xl font-bold text-foreground">3.5h</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Précipitations Totales</p>
                  <p className="text-2xl font-bold text-foreground">651mm</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher par date, zone ou événement..."
                  className="pl-10"
                />
              </div>
              <div className="flex space-x-2">
                <Input type="date" className="w-auto" />
                <Input type="date" className="w-auto" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events">Événements</TabsTrigger>
            <TabsTrigger value="trends">Tendances</TabsTrigger>
            <TabsTrigger value="zones">Par Zone</TabsTrigger>
          </TabsList>

          {/* Événements historiques */}
          <TabsContent value="events" className="space-y-4">
            {historicalEvents.map((event) => {
              const config = severityConfig[event.severity];
              return (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <Badge className={`${config.color} text-white`}>
                            {config.text}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {event.title}
                        </h3>
                        <p className="text-muted-foreground mb-3">{event.description}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Voir Détails
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Zones Affectées</p>
                        <div className="flex flex-wrap gap-1">
                          {event.locations.map((location, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {location}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Durée</p>
                        <p className="font-medium">{event.duration}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Personnes Affectées</p>
                        <p className="font-medium">{event.affected.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Précipitations</p>
                        <p className="font-medium">{event.rainfall}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Rapport</p>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Tendances mensuelles */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Évolution Mensuelle 2024
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 text-sm font-medium">{stat.month}</div>
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <span>{stat.events} événements</span>
                          <span>{stat.totalRain} de pluie</span>
                          <span>Durée moyenne: {stat.avgDuration}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <div 
                          className="h-2 bg-primary rounded-full"
                          style={{ width: `${stat.events * 10}px` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analyse Saisonnière</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <h4 className="font-medium text-primary mb-2">Saison des Pluies (Juin-Septembre)</h4>
                    <p className="text-sm text-muted-foreground">
                      Pic d'activité avec 70% des événements de l'année. 
                      Précipitations moyennes de 180mm/mois.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <h4 className="font-medium text-success mb-2">Saison Sèche (Octobre-Mai)</h4>
                    <p className="text-sm text-muted-foreground">
                      Activité réduite avec des événements sporadiques. 
                      Principalement liés aux orages isolés.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistiques par zone */}
          <TabsContent value="zones" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zoneStats.map((zone, index) => {
                const config = severityConfig[zone.riskLevel];
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{zone.zone}</h3>
                        <Badge className={`${config.color} text-white`}>
                          {config.text}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Événements 2024:</span>
                          <span className="font-medium">{zone.events}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dernier événement:</span>
                          <span className="font-medium">
                            {new Date(zone.lastEvent).toLocaleDateString('fr-FR', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Stats
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Historique;