import { Layout } from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import heroImage from "@/assets/flood.jpg";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { MapPreview } from "@/components/dashboard/MapPreview";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentActivity, ActivityItem } from "@/components/dashboard/RecentActivity";
import { Sparkline } from "@/components/charts/Sparkline";
import { 
  Droplets, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Bell, 
  Plus 
} from "lucide-react";
import { useApi } from "../hooks/useApi";
import { useRealtime } from "@/hooks/useRealtime";
import { useTranslation } from 'react-i18next';

const Index = () => {
  const { t } = useTranslation();
  // Période sélectionnée (7j, 30j, 90j)
  const [period, setPeriod] = useState<"7j" | "30j" | "90j">("30j");

  // Données via API
  const { data: alertsData } = useApi("alertes");
  const { data: reportsData } = useApi("signalements");
  const { lastEvent } = useRealtime("http://127.0.0.1:8000/api/realtime/stream");

  // KPI dérivés (fallback si pas de données)
  const zonesSurveillees = 24; // TODO: brancher si endpoint dispo
  const alertesActives = Array.isArray(alertsData) ? alertsData.filter((a: any) => String(a.status || a.etat || "active").includes("active")).length : 3;
  const signalementsSemaine = Array.isArray(reportsData) ? reportsData.length : 127;
  const predictionIa = 78; // placeholder

  // Sparkline: dérivé des signalements par jour (mock si absent)
  const [sparkData, setSparkData] = useState<number[]>([]);
  useEffect(() => {
    if (Array.isArray(reportsData) && reportsData.length > 0) {
      // Regrouper par jour sur 30 jours
      const byDay: Record<string, number> = {};
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        byDay[key] = 0;
      }
      for (const r of reportsData) {
        const dateStr = String(r.created_at || r.date || r.time || "").slice(0, 10);
        if (byDay[dateStr] !== undefined) byDay[dateStr] += 1;
      }
      setSparkData(Object.values(byDay));
    } else {
      // fallback aléatoire
      const data = Array.from({ length: 30 }, (_, i) => {
        const base = 20 + Math.sin(i / 3) * 5;
        const noise = Math.random() * 6 - 3;
        return Math.max(0, Math.round(base + noise));
      });
      setSparkData(data);
    }
  }, [reportsData]);

  // Mise à jour sparkline légère sur événement temps réel mock
  useEffect(() => {
    if (!lastEvent) return;
    if (typeof lastEvent.payload?.value === 'number') {
      setSparkData((prev) => {
        const next = prev.length ? [...prev.slice(1), lastEvent.payload.value] : prev;
        return next.length ? next : prev;
      });
    }
  }, [lastEvent]);

  // Activité: mapper alertes -> ActivityItem
  const recentActivity: ActivityItem[] = Array.isArray(alertsData)
    ? alertsData.slice(0, 6).map((a: any, idx: number) => ({
        id: String(a.id ?? a.pk ?? idx),
        type: String(a.level || a.niveau || "info").toLowerCase().includes("crit") ? "alert" : "info",
        title: a.title || a.titre || a.name || "Alerte",
        user: a.source || a.emetteur || "Système",
        time: String(a.time || a.created_at || a.date || "").replace("T", " ").replace("Z", ""),
      }))
    : [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header enrichi */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <div className="hidden md:flex items-center text-sm text-muted-foreground mr-2">
              Période:
            </div>
            <div className="flex items-center rounded-md border bg-background text-sm">
              {["7j", "30j", "90j"].map((p, idx) => (
                <button
                  key={p}
                  className={`px-3 py-1.5 ${p === period ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
                  onClick={() => setPeriod(p as any)}
                >
                  {p}
                </button>
              ))}
            </div>
            <Button variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Alertes
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Signalement
            </Button>
          </div>
        </div>

        {/* Hero Image Section */}
        <section className="relative rounded-xl overflow-hidden h-[26rem] md:h-[32rem] lg:h-[40rem] shadow-sm">
          <img
            src={heroImage}
            alt="Photo locale d'inondation"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
          <div className="relative h-full flex items-center justify-center text-center">
            <div className="p-4 md:p-6">
              <DynamicHeroTitle />
              <p className="text-white mt-4 max-w-3xl mx-auto text-base md:text-xl font-bold">
                Visualisation des précipitations, niveaux d'eau et alertes prioritaires pour anticiper les inondations.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Zones Surveillées"
            value={String(zonesSurveillees)}
            description="Capteurs actifs"
            icon={Droplets}
            variant="ocean"
            trend="up"
            trendValue="2 nouvelles"
          />
          <StatsCard
            title="Alertes Actives"
            value={String(alertesActives)}
            description="Niveau élevé"
            icon={AlertTriangle}
            variant="alert"
            trend="down"
            trendValue="5 résolues"
          />
          <StatsCard
            title="Signalements Citoyens"
            value={String(signalementsSemaine)}
            description="Cette semaine"
            icon={Users}
            trend="up"
            trendValue="+23%"
          />
          <StatsCard
            title="Prédiction IA"
            value={`${predictionIa}%`}
            description="Précision du modèle"
            icon={TrendingUp}
            variant="success"
            trend="up"
            trendValue="+5%"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Alerts */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-danger" />
              {t('dashboard.recentAlerts')}
            </h2>
            {/* Trois alertes les plus récentes basées sur alertsData */}
            {Array.isArray(alertsData) && alertsData.slice(0, 3).map((a: any, i: number) => (
            <AlertCard
                key={String(a.id ?? a.pk ?? i)}
                level={(String(a.level || a.niveau || 'info').toLowerCase().includes('crit') ? 'critical' : (String(a.level || a.niveau || 'info').toLowerCase().includes('high') ? 'high' : (String(a.level || a.niveau || 'info').toLowerCase().includes('medium') ? 'medium' : 'info'))) as any}
                title={a.title || a.titre || a.name || 'Alerte'}
                message={a.message || a.description || ''}
                location={(() => { const loc=a.location || a.localisation; return typeof loc==='object'&&loc? (loc.nom||JSON.stringify(loc)) : (loc||'-'); })()}
                time={String(a.time || a.created_at || a.date || '')}
                isActive={String(a.status || a.etat || 'active').includes('active')}
              />
            ))}
          </div>

          {/* Center Column - Map + Sparkline */}
          <div className="space-y-4">
            <MapPreview />
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-sm">{t('dashboard.trend30')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Sparkline data={sparkData} height={90} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Weather + Recent Activity */}
          <div className="space-y-4">
            <WeatherCard />
            <RecentActivity items={recentActivity} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Titre dynamique avec mots rotatifs
function DynamicHeroTitle() {
  const words = ["Surveillez", "Anticipez", "Protégez"]; // dynamique
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <h2 className="text-white font-extrabold text-3xl md:text-5xl lg:text-6xl">
      <span className="inline-block">{words[index]}</span>{" "}
      <span className="inline-block">les zones à risque en temps réel</span>
    </h2>
  );
}

export default Index;