import { Layout } from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import heroImage from "@/assets/flood.jpg";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { MapPreview } from "@/components/dashboard/MapPreview";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { Button } from "@/components/ui/button";
import { useApi } from "../hooks/useApi";
import { 
  Droplets, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Bell, 
  Plus 
} from "lucide-react";

const Index = () => {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
              Système de Surveillance des Inondations
            </h1>
            <p className="text-muted-foreground mt-1">
              Surveillance en temps réel des risques d'inondation à Dakar
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
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
            value="24"
            description="Capteurs actifs"
            icon={Droplets}
            variant="ocean"
            trend="up"
            trendValue="2 nouvelles"
          />
          <StatsCard
            title="Alertes Actives"
            value="3"
            description="Niveau élevé"
            icon={AlertTriangle}
            variant="alert"
            trend="down"
            trendValue="5 résolues"
          />
          <StatsCard
            title="Signalements Citoyens"
            value="127"
            description="Cette semaine"
            icon={Users}
            trend="up"
            trendValue="+23%"
          />
          <StatsCard
            title="Prédiction IA"
            value="78%"
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
              Alertes Récentes
            </h2>
            <AlertCard
              level="critical"
              title="Risque d'inondation majeur"
              message="Niveau d'eau critique détecté dans la zone de Guédiawaye. Évacuation recommandée."
              location="Guédiawaye, Pikine"
              time="Il y a 5 min"
              isActive
            />
            <AlertCard
              level="high"
              title="Fortes précipitations prévues"
              message="Les modèles météo prévoient 50mm de pluie dans les 3 prochaines heures."
              location="Médina, Plateau"
              time="Il y a 15 min"
            />
            <AlertCard
              level="medium"
              title="Surveillance renforcée"
              message="Niveau d'eau en hausse constante depuis 2h. Situation à surveiller."
              location="Yeumbeul Sud"
              time="Il y a 1h"
            />
          </div>

          {/* Center Column - Map */}
          <div>
            <MapPreview />
          </div>

          {/* Right Column - Weather */}
          <div>
            <WeatherCard />
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