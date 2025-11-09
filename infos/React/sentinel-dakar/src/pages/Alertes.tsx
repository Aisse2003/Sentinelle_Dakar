import React, { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useApi } from "../hooks/useApi";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  AlertTriangle, 
  Search, 
  Filter,
  Clock,
  MapPin,
  Volume2,
  Settings,
  Archive
} from "lucide-react";
import { useTranslation } from 'react-i18next';
import { getUserProfile } from "@/services/auth";

// Données dynamiques via API
type Alerte = { id: number; title?: string; message?: string; level?: keyof typeof levelConfig; location?: string; time?: string; affected?: number; status?: string };

type RecentAlerte = { id: number; title?: string; message?: string; level?: keyof typeof levelConfig; location?: string; time?: string; resolvedAt?: string };

const levelConfig = {
  critical: { 
    color: "bg-destructive", 
    text: "Critique", 
    textColor: "text-destructive",
    bgColor: "bg-destructive/10" 
  },
  high: { 
    color: "bg-danger", 
    text: "Élevé", 
    textColor: "text-danger",
    bgColor: "bg-danger/10" 
  },
  medium: { 
    color: "bg-warning", 
    text: "Moyen", 
    textColor: "text-warning",
    bgColor: "bg-warning/10" 
  },
  resolved: { 
    color: "bg-success", 
    text: "Résolu", 
    textColor: "text-success",
    bgColor: "bg-success/10" 
  },
  info: { 
    color: "bg-primary", 
    text: "Info", 
    textColor: "text-primary",
    bgColor: "bg-primary/10" 
  }
};

function mapToUiLevel(raw?: string): keyof typeof levelConfig {
  const v = (raw || "").toLowerCase();
  if (["critique", "critical"].includes(v)) return "critical";
  if (["fort", "eleve", "élevé", "high"].includes(v)) return "high";
  if (["moyen", "medium"].includes(v)) return "medium";
  if (["resolu", "résolu", "resolved"].includes(v)) return "resolved";
  // "faible" ou inconnu -> info
  return "info";
}

function mapToUiStatus(raw?: string): "active" | "resolved" | "archived" | "other" {
  const v = (raw || "").toLowerCase();
  if (["active", "actif", "ouvert", "open", "en_cours", "en cours"].includes(v)) return "active";
  if (["resolved", "resolu", "résolu", "closed", "ferme", "fermé"].includes(v)) return "resolved";
  if (["archived", "archive", "archivées", "archivée", "archivee"].includes(v)) return "archived";
  return "other";
}

const Alertes = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<string>("");
  const [photosByAlert, setPhotosByAlert] = useState<Record<number, string[]>>({});
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<{
    alert: Alerte;
    photos: string[];
    signalement?: {
      description?: string;
      severity?: string;
      location_text?: string;
      created_at?: string;
      prenom?: string;
      nom?: string;
      phone?: string;
    };
  } | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { data, status, error } = useApi("alertes", { search: search || undefined, level: level || undefined });
  const [isAuthority, setIsAuthority] = useState(false);
  const loading = status === "pending";
  const rawAlertes: any[] = Array.isArray(data) ? data : [];

  const alertes: Alerte[] = useMemo(() => {
    // Normalisation: gère les champs backend possibles (titre/description/niveau/localisation/created_at)
    return rawAlertes.map((a) => {
      const levelRaw = a.level ?? a.niveau ?? "info";
      const level = mapToUiLevel(levelRaw);
      const loc = a.location ?? a.localisation;
      const location = typeof loc === "object" && loc !== null ? (loc.nom || JSON.stringify(loc)) : loc;
      return {
      id: a.id ?? a.pk ?? Math.random(),
        title: a.title ?? a.titre ?? a.name ?? "Alerte",
        message: a.message ?? a.description ?? "",
        level: level as any,
        location,
        time: a.time ?? a.created_at ?? a.date ?? "",
      affected: a.affected ?? a.personnes_affectees,
        status: a.status ?? a.etat ?? "active",
      };
    });
  }, [rawAlertes]);

  const activeAlerts = alertes.filter((a) => mapToUiStatus(a.status || (a as any).etat) === "active");
  const recentAlerts: RecentAlerte[] = alertes
    .filter((a) => {
      const s = mapToUiStatus(a.status || (a as any).etat);
      return s === "resolved" || s === "archived";
    })
    .map((a) => ({ ...a, resolvedAt: (a as any).resolvedAt ?? (a as any).resolved_at }));

  // Déterminer si l'utilisateur est autorité (staff)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) { if (!cancelled) setIsAuthority(false); return; }
        const me = await getUserProfile();
        if (!cancelled) setIsAuthority(!!(me?.is_staff || me?.is_superuser));
      } catch {
        if (!cancelled) setIsAuthority(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Précharger les photos de chaque alerte (limité au top 20 ; réservé autorités pour éviter 403)
  useEffect(() => {
    if (!isAuthority) return; // éviter appels 403 pour les citoyens
    const base = "http://127.0.0.1:8000/api";
    const ids = alertes.map((a) => a.id).filter((id): id is number => typeof id === 'number').slice(0, 20);
    if (ids.length === 0) return;
    let cancelled = false;
    Promise.all(
      ids.map(async (id) => {
        try {
          const { data: sigs } = await axios.get(`${base}/signalements/`, { params: { alerte_id: id } });
          const photos: string[] = Array.isArray(sigs) ? (sigs[0]?.photos || []) : [];
          return [id, photos] as const;
        } catch {
          return [id, []] as const;
        }
      })
    ).then((entries) => {
      if (cancelled) return;
      const map: Record<number, string[]> = {};
      for (const [id, photos] of entries) map[id] = [...photos];
      setPhotosByAlert(map);
    });
    return () => { cancelled = true; };
  }, [alertes.length, isAuthority]);
  return (
    <>
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">{t('alerts.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              {t('common.preferences', { defaultValue: 'Préférences' })}
            </Button>
            <Button>
              <Volume2 className="h-4 w-4 mr-2" />
              {t('common.testAlert', { defaultValue: 'Test Alerte' })}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gradient-alert text-danger-foreground">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{t('alerts.active', { defaultValue: 'Alertes Actives' })}</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <AlertTriangle className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('alerts.affected', { defaultValue: 'Personnes Affectées' })}</p>
                  <p className="text-2xl font-bold text-foreground">148K</p>
                </div>
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('alerts.resolvedToday', { defaultValue: "Résolues Aujourd'hui" })}</p>
                  <p className="text-2xl font-bold text-foreground">7</p>
                </div>
                <Archive className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-safe text-success-foreground">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{t('alerts.avgTime', { defaultValue: 'Temps Moyen' })}</p>
                  <p className="text-2xl font-bold">23min</p>
                </div>
                <Clock className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t('common.search')+ '...'}
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select className="border rounded-md p-2 bg-background" value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option value="">{t('alerts.levelAll', { defaultValue: 'Tous niveaux' })}</option>
                  <option value="critical">{t('alerts.levelCritical', { defaultValue: 'Critique' })}</option>
                  <option value="high">{t('alerts.levelHigh', { defaultValue: 'Élevé' })}</option>
                  <option value="medium">{t('alerts.levelMedium', { defaultValue: 'Moyen' })}</option>
                  <option value="info">{t('alerts.levelInfo', { defaultValue: 'Info' })}</option>
                  <option value="resolved">{t('alerts.levelResolved', { defaultValue: 'Résolu' })}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">{t('alerts.active', { defaultValue: 'Alertes Actives' })}</TabsTrigger>
            <TabsTrigger value="recent">{t('alerts.recent', { defaultValue: 'Récentes' })}</TabsTrigger>
            <TabsTrigger value="archived">{t('alerts.archived', { defaultValue: 'Archivées' })}</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {loading && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
            {error && <p className="text-sm text-destructive">{t('alerts.loadError', { defaultValue: 'Impossible de charger les alertes.' })}</p>}
            {!loading && activeAlerts.map((alert) => {
              const config = levelConfig[alert.level || "info"];
              return (
                <Card key={alert.id} className={`${config.bgColor} border-l-4 ${config.color.replace('bg-', 'border-')}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`h-6 w-6 ${config.textColor}`} />
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{alert.title}</h3>
                          <Badge className={`${config.color} text-white mt-1`}>
                            {config.text}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={async () => {
                          try {
                            const base = "http://127.0.0.1:8000/api";
                            const { data: sigs } = await axios.get(`${base}/signalements/`, { params: { alerte_id: alert.id } });
                            const first = Array.isArray(sigs) ? sigs[0] : null;
                            const photos: string[] = first?.photos || [];
                            setDetailData({ alert, photos, signalement: first || undefined });
                            setDetailOpen(true);
                          } catch (e) {
                            window.alert(t('alerts.detailsError', { defaultValue: 'Impossible de charger les détails.' }) as string);
                          }
                        }}>
                          {t('alerts.details', { defaultValue: 'Détails' })}
                        </Button>
                        <Button size="sm">
                          {t('common.actions', { defaultValue: 'Actions' })}
                        </Button>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{alert.message}</p>

                    {(photosByAlert[alert.id as number]?.length || 0) > 0 && (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {photosByAlert[alert.id as number].slice(0, 6).map((u) => (
                          <img key={u} src={u} className="w-full h-24 object-cover rounded-md border" />
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{alert.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{alert.time}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Bell className="h-4 w-4" />
                        {typeof alert.affected === 'number' && (
                          <span>{alert.affected.toLocaleString()} {t('alerts.peopleAffected', { defaultValue: 'personnes affectées' })}</span>
                        )}
                      </div>
                    </div>

                    {alert.level === 'critical' && (
                      <div className="mt-4 p-3 rounded-lg bg-destructive/20 border border-destructive/30">
                        <p className="text-sm font-medium text-destructive">
                          {t('alerts.criticalNotice', { defaultValue: '⚠️ Alerte Critique - Action immédiate requise' })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {loading && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
            {error && <p className="text-sm text-destructive">{t('alerts.loadError', { defaultValue: 'Impossible de charger les alertes.' })}</p>}
            {!loading && recentAlerts.map((alert) => {
              const config = levelConfig[alert.level];
              return (
                <Card key={alert.id} className={config.bgColor}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`h-3 w-3 rounded-full ${config.color}`} />
                        <div>
                          <h4 className="font-medium text-foreground">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{alert.time}</p>
                        <p>{t('alerts.resolvedAt', { defaultValue: 'Résolu à' })} {alert.resolvedAt}</p>
                      </div>
                    </div>
                    {(photosByAlert[alert.id as number]?.length || 0) > 0 && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {photosByAlert[alert.id as number].slice(0, 8).map((u) => (
                          <img key={u} src={u} className="w-full h-20 object-cover rounded-md border" />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="archived">
            <Card>
              <CardContent className="p-8 text-center">
                <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">{t('alerts.archived', { defaultValue: 'Alertes Archivées' })}</h3>
                <p className="text-muted-foreground">
                  {t('alerts.checkHistory', { defaultValue: "Consultez l'historique complet des alertes dans la section Historique." })}
                </p>
                <Button className="mt-4" variant="outline">
                  {t('nav.history')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
    {detailOpen && detailData && (
      <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={() => setDetailOpen(false)}>
        <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('alerts.details', { defaultValue: "Détails de l'alerte" })}</h3>
            <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setDetailOpen(false)}>{t('common.close', { defaultValue: 'Fermer' })}</button>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('common.title')}</p>
                <p className="font-medium text-foreground">{detailData.alert.title || "Alerte"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('alerts.level', { defaultValue: 'Niveau' })}</p>
                <p className="font-medium capitalize">{detailData.alert.level}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('map.locate')}</p>
                <p className="font-medium">{detailData.alert.location || detailData.signalement?.location_text || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('common.date')}</p>
                <p className="font-medium">{String(detailData.alert.time || detailData.signalement?.created_at || "").replace("T", " ").replace("Z", "")}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('alerts.message', { defaultValue: 'Message' })}</p>
              <p className="text-foreground">{detailData.alert.message || detailData.signalement?.description || ""}</p>
            </div>
            {detailData.signalement && (detailData.signalement.prenom || detailData.signalement.nom || detailData.signalement.phone) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('report.firstName')}</p>
                  <p className="font-medium">{detailData.signalement.prenom || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('report.lastName')}</p>
                  <p className="font-medium">{detailData.signalement.nom || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('report.phone')}</p>
                  <p className="font-medium">{detailData.signalement.phone || "-"}</p>
                </div>
              </div>
            )}
            {(detailData.photos?.length || 0) > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t('report.photos')}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {detailData.photos.map((u, idx) => (
                    <img
                      key={u}
                      src={u}
                      className="w-full h-40 object-cover rounded-md border cursor-zoom-in"
                      onClick={() => {
                        setLightboxPhotos(detailData.photos);
                        setLightboxIndex(idx);
                        setLightboxOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    {lightboxOpen && (
      <div
        className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center"
        onClick={() => setLightboxOpen(false)}
      >
        <button
          className="absolute top-4 right-4 text-white/80 hover:text-white text-xl"
          onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
          aria-label="Fermer"
        >
          ×
        </button>
        <button
          className="absolute left-4 text-white/80 hover:text-white text-3xl select-none"
          onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + lightboxPhotos.length) % lightboxPhotos.length); }}
          aria-label="Précédent"
        >
          ‹
        </button>
        <img
          src={lightboxPhotos[lightboxIndex]}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-md shadow-xl"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          className="absolute right-4 text-white/80 hover:text-white text-3xl select-none"
          style={{ right: '1rem' }}
          onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % lightboxPhotos.length); }}
          aria-label="Suivant"
        >
          ›
        </button>
        <a
          href={lightboxPhotos[lightboxIndex]}
          download
          className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-foreground text-sm px-3 py-1.5 rounded-md shadow"
          onClick={(e) => e.stopPropagation()}
        >
          Télécharger
        </a>
      </div>
    )}
    </>
  );
};

export default Alertes;