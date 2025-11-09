import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/pages/../hooks/useApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkline } from "@/components/charts/Sparkline";
import { useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Download,
  RefreshCw,
  Calendar,
  Target,
} from "lucide-react";
import { useTranslation } from 'react-i18next';

const performanceMetrics = [
  { title: "Temps de Réponse Moyen", value: "4.2 min", change: "-15%", trend: "down", description: "Amélioration continue" },
  { title: "Précision des Alertes", value: "94.7%", change: "+3.2%", trend: "up", description: "Au-dessus de l'objectif" },
  { title: "Couverture Géographique", value: "89%", change: "+8%", trend: "up", description: "Extension en cours" },
  { title: "Disponibilité Système", value: "99.8%", change: "0%", trend: "stable", description: "Objectif atteint" }
] as const;

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
} as const;

export default function StatsDashboard() {
  const { data: alertsData, status: alertsStatus, error: alertsError } = useApi("alertes");
  const { data: reportsData, status: reportsStatus } = useApi("signalements");
  const { t } = useTranslation();

  const loading = alertsStatus === "pending" || reportsStatus === "pending";

  // Filtres
  const [period, setPeriod] = useState<"7j" | "30j" | "90j">("30j");
  const [zone, setZone] = useState<string>("");

  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - n);
  const inLastNDays = (d: any, n: number) => {
    const s = String(d || "");
    const dt = new Date(s);
    return isFinite(dt.getTime()) ? dt >= daysAgo(n) : false;
  };
  const isToday = (d: any) => {
    const dt = new Date(String(d || ""));
    const t = new Date();
    return dt.getFullYear() === t.getFullYear() && dt.getMonth() === t.getMonth() && dt.getDate() === t.getDate();
  };

  const getZoneName = (x: any): string => {
    const loc = x?.location ?? x?.localisation ?? x?.location_text;
    if (typeof loc === "object" && loc) return String(loc.nom || loc.name || "");
    return String(loc || "");
  };

  const periodDays = period === "7j" ? 7 : period === "90j" ? 90 : 30;

  const usageDynamic = useMemo(() => {
    let alerts = Array.isArray(alertsData) ? alertsData : [];
    let reports = Array.isArray(reportsData) ? reportsData : [];
    if (zone) {
      const z = zone.toLowerCase();
      alerts = alerts.filter(a => getZoneName(a).toLowerCase().includes(z));
      reports = reports.filter(a => getZoneName(a).toLowerCase().includes(z));
    }
    const count = (arr: any[], nDays?: number, todayOnly?: boolean) => {
      if (todayOnly) return arr.filter(a => isToday(a.created_at || a.date || a.time)).length;
      if (nDays) return arr.filter(a => inLastNDays(a.created_at || a.date || a.time, nDays)).length;
      return arr.length;
    };
    if (alerts.length === 0 && reports.length === 0) return usageStats;
    return [
      { period: "Aujourd'hui", alerts: count(alerts, undefined, true), reports: count(reports, undefined, true), users: 0 },
      { period: "Cette semaine", alerts: count(alerts, 7), reports: count(reports, 7), users: 0 },
      { period: "Ce mois", alerts: count(alerts, 30), reports: count(reports, 30), users: 0 },
      { period: "Cette année", alerts: count(alerts, 365), reports: count(reports, 365), users: 0 },
    ];
  }, [alertsData, reportsData, zone]);

  const sparkData = useMemo(() => {
    let src = Array.isArray(alertsData) && alertsData.length ? alertsData : (Array.isArray(reportsData) ? reportsData : []);
    if (zone) {
      const z = zone.toLowerCase();
      src = src.filter(a => getZoneName(a).toLowerCase().includes(z));
    }
    if (!src.length) return Array.from({ length: periodDays }, (_, i) => Math.max(0, Math.round(10 + Math.sin(i / 3) * 3)));
    const byDay: Record<string, number> = {};
    for (let i = periodDays - 1; i >= 0; i--) byDay[daysAgo(i).toISOString().slice(0,10)] = 0;
    for (const a of src) {
      const k = String(a.created_at || a.date || a.time || "").slice(0,10);
      if (byDay[k] !== undefined) byDay[k] += 1;
    }
    return Object.values(byDay);
  }, [alertsData, reportsData, zone, periodDays]);

  // Actions filtres
  const resetFilters = () => {
    setPeriod("30j");
    setZone("");
  };

  const exportCsv = () => {
    const rows = [["period", "alerts", "reports", "users", "filters.period", "filters.zone"]];
    for (const s of usageDynamic) {
      rows.push([
        String(s.period),
        String(s.alerts),
        String(s.reports),
        String(s.users || 0),
        period,
        zone || ""
      ]);
    }
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `stats_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">{t('stats.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('stats.subtitle', { defaultValue: 'Analyse des performances et métriques du système' })}
          </p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('common.refresh', { defaultValue: 'Actualiser' })}
          </Button>
          <Button onClick={exportCsv}>
            <Download className="h-4 w-4 mr-2" />
            {t('common.report', { defaultValue: 'Rapport' })}
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('stats.period', { defaultValue: 'Période:' })}</span>
          <div className="flex items-center rounded-md border bg-background text-sm">
            {["7j","30j","90j"].map(p => (
              <button key={p} className={`px-3 py-1.5 ${p===period? 'bg-primary text-primary-foreground':'hover:bg-accent hover:text-accent-foreground'}`} onClick={()=>setPeriod(p as any)}>{p}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('stats.zone', { defaultValue: 'Zone:' })}</span>
          <select className="border rounded-md p-2 bg-background min-w-[200px]" value={zone} onChange={(e)=>setZone(e.target.value)}>
            <option value="">Toutes</option>
            {Array.from(new Set([
              ...(Array.isArray(alertsData)? alertsData: []).map(getZoneName),
              ...(Array.isArray(reportsData)? reportsData: []).map(getZoneName),
            ].filter(Boolean))).slice(0,50).map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
          <Button variant="outline" onClick={resetFilters}>{t('common.reset', { defaultValue: 'Réinitialiser' })}</Button>
          <Button onClick={exportCsv}>
            <Download className="h-4 w-4 mr-2" />
            {t('stats.exportCsv', { defaultValue: 'Export CSV' })}
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

      {/* Sparkline global (alertes/signalements) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('stats.trend30', { defaultValue: 'Tendance 30 jours (alertes/signalements)' })}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Sparkline data={sparkData} height={90} />
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('stats.overview', { defaultValue: "Vue d'ensemble" })}</TabsTrigger>
          <TabsTrigger value="zones">{t('stats.byZone', { defaultValue: 'Par Zone' })}</TabsTrigger>
          <TabsTrigger value="sensors">{t('stats.sensors', { defaultValue: 'Capteurs' })}</TabsTrigger>
          <TabsTrigger value="usage">{t('stats.usage', { defaultValue: 'Utilisation' })}</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alertes par période */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  {t('stats.alertsByPeriod', { defaultValue: 'Alertes par Période' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageDynamic.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{stat.period}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-danger">{stat.alerts}</p>
                          <p className="text-xs text-muted-foreground">{t('common.alerts')}</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-primary">{stat.reports}</p>
                          <p className="text-xs text-muted-foreground">{t('stats.reports', { defaultValue: 'Signalements' })}</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-success">{(stat.users||0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{t('stats.users', { defaultValue: 'Utilisateurs' })}</p>
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
                  {t('stats.targetsVsActuals', { defaultValue: 'Objectifs vs Réalisations' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceMetrics.map((metric, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{metric.title}</span>
                        <span className="text-success font-medium">{metric.trend === "up" ? t('stats.exceeded', { defaultValue: 'Dépassé' }) : metric.trend === "down" ? t('stats.toImprove', { defaultValue: 'À améliorer' }) : t('stats.stable', { defaultValue: 'Stable' })}</span>
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
              const config = statusConfig[zone.status as keyof typeof statusConfig];
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
                        <p className="text-muted-foreground">{t('stats.alertsEmitted', { defaultValue: 'Alertes émises' })}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-foreground">{zone.accuracy}</p>
                        <p className="text-muted-foreground">{t('stats.accuracy', { defaultValue: 'Précision' })}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-foreground">{zone.responseTime}</p>
                        <p className="text-muted-foreground">{t('stats.responseTime', { defaultValue: 'Temps réponse' })}</p>
                      </div>
                      <div className="flex items-center justify-center p-3 rounded-lg bg-muted/50">
                        <Button size="sm" variant="outline">{t('common.seeDetails', { defaultValue: 'Voir détails' })}</Button>
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
                      <p className="text-sm text-muted-foreground">{t('stats.total', { defaultValue: 'Total' })}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-success">{sensor.active}</p>
                      <p className="text-sm text-muted-foreground">{t('stats.active', { defaultValue: 'Actifs' })}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-danger">{sensor.offline}</p>
                      <p className="text-sm text-muted-foreground">{t('stats.offline', { defaultValue: 'Hors ligne' })}</p>
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
                {t('stats.platformUsage', { defaultValue: 'Utilisation Plateforme' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">25.6K</div>
                  <div className="text-sm text-muted-foreground">{t('stats.activeUsers', { defaultValue: 'Utilisateurs actifs' })}</div>
                  <div className="text-xs text-success">+12% ce mois</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">4.2K</div>
                  <div className="text-sm text-muted-foreground">{t('stats.dailySessions', { defaultValue: 'Sessions quotidiennes' })}</div>
                  <div className="text-xs text-success">+8% cette semaine</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">2.8min</div>
                  <div className="text-sm text-muted-foreground">{t('stats.avgSessionDuration', { defaultValue: 'Durée moyenne session' })}</div>
                  <div className="text-xs text-muted-foreground">Stable</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {loading && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
      {alertsError && <p className="text-sm text-destructive">{t('alerts.loadError', { defaultValue: 'Erreur chargement alertes.' })}</p>}
    </div>
  );
}


