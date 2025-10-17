import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApi } from "../hooks/useApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity,
  Download,
  RefreshCw,
  Calendar,
  Target,
  AlertTriangle
} from "lucide-react";

const performanceMetrics = [
  { title: "Temps de Réponse Moyen", value: "4.2 min", change: "-15%", trend: "down", description: "Amélioration continue" },
  { title: "Précision des Alertes", value: "94.7%", change: "+3.2%", trend: "up", description: "Au-dessus de l'objectif" },
  { title: "Couverture Géographique", value: "89%", change: "+8%", trend: "up", description: "Extension en cours" },
  { title: "Disponibilité Système", value: "99.8%", change: "0%", trend: "stable", description: "Objectif atteint" }
];

const usageStats = [
  { period: "Aujourd'hui", alerts: 12, reports: 28, users: 1456 },
  { period: "Cette semaine", alerts: 89, reports: 156, users: 8934 },
  { period: "Ce mois", alerts: 234, reports: 567, users: 25678 },
  { period: "Cette année", alerts: 1876, reports: 4532, users: 156789 }
];

const zonePerformance = [
  { zone: "Guédiawaye", alerts: 45, accuracy: "96%", responseTime: "3.1 min", status: "excellent" },
  { zone: "Pikine", alerts: 38, accuracy: "94%", responseTime: "3.8 min", status: "good" },
  { zone: "Yeumbeul", alerts: 29, accuracy: "92%", responseTime: "4.2 min", status: "good" },
  { zone: "Médina", alerts: 18, accuracy: "98%", responseTime: "2.9 min", status: "excellent" },
  { zone: "Plateau", alerts: 12, accuracy: "89%", responseTime: "5.1 min", status: "average" },
];

const sensorStats = [
  { type: "Pluviomètres", total: 24, active: 22, offline: 2, efficiency: "92%" },
  { type: "Niveaux d'eau", total: 18, active: 17, offline: 1, efficiency: "94%" },
  { type: "Débitmètres", total: 12, active: 11, offline: 1, efficiency: "92%" },
  { type: "Stations météo", total: 8, active: 8, offline: 0, efficiency: "100%" },
];

const statusConfig = {
  excellent: { color: "bg-success", text: "Excellent" },
  good: { color: "bg-primary", text: "Bon" },
  average: { color: "bg-warning", text: "Moyen" },
  poor: { color: "bg-danger", text: "Faible" }
};

const Stats = () => {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
              Tableau de Bord Statistiques
            </h1>
            <p className="text-muted-foreground mt-1">
              Analyse des performances et métriques du système
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Rapport
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceMetrics.map((metric, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
                  <Badge 
                    variant="outline" 
                    className={
                      metric.trend === "up" ? "text-success border-success" :
                      metric.trend === "down" ? "text-danger border-danger" :
                      "text-muted-foreground"
                    }
                  >
                    {metric.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {metric.value}
                </div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
                <div className="mt-3 flex items-center text-xs text-muted-foreground">
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-success" />
                  ) : metric.trend === "down" ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-danger rotate-180" />
                  ) : (
                    <Activity className="h-3 w-3 mr-1" />
                  )}
                  vs. mois dernier
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="zones">Par Zone</TabsTrigger>
            <TabsTrigger value="sensors">Capteurs</TabsTrigger>
            <TabsTrigger value="usage">Utilisation</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alertes par période */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                    Alertes par Période
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usageStats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{stat.period}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <p className="font-semibold text-danger">{stat.alerts}</p>
                            <p className="text-xs text-muted-foreground">Alertes</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-primary">{stat.reports}</p>
                            <p className="text-xs text-muted-foreground">Signalements</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-success">{stat.users.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Utilisateurs</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Objectifs vs réalisations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    Objectifs vs Réalisations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {performanceMetrics.map((metric, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{metric.title}</span>
                        <span className="text-success font-medium">{metric.trend === "up" ? "Dépassé" : metric.trend === "down" ? "À améliorer" : "Stable"}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-2 bg-success rounded-full" style={{ width: metric.value.replace(/[^\d]/g, "") + "%" }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance par zone */}
          <TabsContent value="zones" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {zonePerformance.map((zone, index) => {
                const config = statusConfig[zone.status];
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{zone.zone}</h3>
                        <Badge className={`${config.color} text-white`}>{config.text}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold text-foreground">{zone.alerts}</p>
                          <p className="text-muted-foreground">Alertes émises</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold text-foreground">{zone.accuracy}</p>
                          <p className="text-muted-foreground">Précision</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <p className="text-2xl font-bold text-foreground">{zone.responseTime}</p>
                          <p className="text-muted-foreground">Temps réponse</p>
                        </div>
                        <div className="flex items-center justify-center p-3 rounded-lg bg-muted/50">
                          <Button size="sm" variant="outline">Voir détails</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* État des capteurs */}
          <TabsContent value="sensors" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sensorStats.map((sensor, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-primary" />
                        {sensor.type}
                      </span>
                      <Badge variant="outline" className="bg-success/10 text-success">{sensor.efficiency}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-foreground">{sensor.total}</p>
                        <p className="text-sm text-muted-foreground">Total</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-success">{sensor.active}</p>
                        <p className="text-sm text-muted-foreground">Actifs</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-danger">{sensor.offline}</p>
                        <p className="text-sm text-muted-foreground">Hors ligne</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Utilisation */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Utilisation Plateforme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-primary">25.6K</div>
                    <div className="text-sm text-muted-foreground">Utilisateurs actifs</div>
                    <div className="text-xs text-success">+12% ce mois</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-primary">4.2K</div>
                    <div className="text-sm text-muted-foreground">Sessions quotidiennes</div>
                    <div className="text-xs text-success">+8% cette semaine</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-primary">2.8min</div>
                    <div className="text-sm text-muted-foreground">Durée moyenne session</div>
                    <div className="text-xs text-muted-foreground">Stable</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Stats;
