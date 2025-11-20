import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApi } from "../hooks/useApi";
import { MapPin, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

type TabKey = "alertes" | "degats" | "assistance";

function mapToUiLevel(raw?: string): "critical" | "high" | "medium" | "resolved" | "info" {
  const v = (raw || "").toLowerCase();
  if (["critique", "critical"].includes(v)) return "critical";
  if (["fort", "eleve", "élevé", "high"].includes(v)) return "high";
  if (["moyen", "medium"].includes(v)) return "medium";
  if (["resolu", "résolu", "resolved"].includes(v)) return "resolved";
  return "info";
}

const levelStyles: Record<string, { color: string; text: string; bgColor?: string }> = {
  critical: { color: "bg-destructive", text: "Critique", bgColor: "bg-destructive/10" },
  high: { color: "bg-danger", text: "Élevé", bgColor: "bg-danger/10" },
  medium: { color: "bg-warning", text: "Moyen", bgColor: "bg-warning/10" },
  resolved: { color: "bg-success", text: "Résolu", bgColor: "bg-success/10" },
  info: { color: "bg-primary", text: "Info", bgColor: "bg-primary/10" },
};

const Historique = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") || "alertes").toLowerCase() as TabKey;
  const [tab, setTab] = useState<TabKey>(["alertes", "degats", "assistance"].includes(initialTab) ? initialTab : "alertes");

  const { data: rawAlertes, status: statusAlerts, error: errorAlerts } = useApi("alertes");
  const { data: rawDegats, status: statusDeg, error: errorDeg } = useApi("degats/mes");
  const { data: rawAssistance, status: statusAss, error: errorAss } = useApi("assistance/mes");

  const alertes = useMemo(() => {
    const items = Array.isArray(rawAlertes) ? rawAlertes : [];
    return items.map((a) => {
      const level = mapToUiLevel(a.level ?? a.niveau);
      const loc = a.location ?? a.localisation;
      const location = typeof loc === "object" && loc !== null ? (loc.nom || JSON.stringify(loc)) : loc;
      return {
        id: a.id ?? a.pk ?? Math.random(),
        title: a.title ?? a.titre ?? a.name ?? "Alerte",
        message: a.message ?? a.description ?? "",
        level,
        location,
        time: a.time ?? a.created_at ?? a.date ?? "",
        status: a.status ?? a.etat ?? "active",
      };
    });
  }, [rawAlertes]);

  const degats = useMemo(() => (Array.isArray(rawDegats) ? rawDegats : []), [rawDegats]);
  const assistances = useMemo(() => (Array.isArray(rawAssistance) ? rawAssistance : []), [rawAssistance]);

  const onTabChange = (value: string) => {
    const v = (value || "alertes") as TabKey;
    setTab(v);
    setSearchParams({ tab: v }, { replace: true });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
            Mon Historique
          </h1>
          <p className="text-muted-foreground mt-1">
            Alertes, dégâts et demandes d’assistance.
          </p>
        </div>

        <Tabs value={tab} onValueChange={onTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="alertes">Alertes</TabsTrigger>
            <TabsTrigger value="degats">Dégâts</TabsTrigger>
            <TabsTrigger value="assistance">Assistance</TabsTrigger>
          </TabsList>

          <TabsContent value="alertes" className="space-y-3">
            {statusAlerts === "pending" && <p className="text-sm text-muted-foreground">Chargement…</p>}
            {errorAlerts && <p className="text-sm text-destructive">Impossible de charger les alertes.</p>}
            {statusAlerts === "success" && alertes.length === 0 && (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Aucune alerte trouvée.
                </CardContent>
              </Card>
            )}
            {alertes.map((a) => {
              const style = levelStyles[a.level] || levelStyles.info;
              return (
                <Card key={String(a.id)} className={`${style.bgColor} hover:shadow-sm transition-shadow`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${style.color} text-white`}>{style.text}</Badge>
                        <h3 className="text-base font-semibold text-foreground">{a.title}</h3>
                      </div>
                    </div>
                    {a.message && <p className="text-sm text-muted-foreground mb-3">{a.message}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{a.location || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{String(a.time).replace("T"," ").replace("Z","")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="degats" className="space-y-3">
            {statusDeg === "pending" && <p className="text-sm text-muted-foreground">Chargement…</p>}
            {errorDeg && <p className="text-sm text-destructive">Impossible de charger vos déclarations de dégâts.</p>}
            {statusDeg === "success" && degats.length === 0 && (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Aucun dégât déclaré.
                </CardContent>
              </Card>
            )}
            {degats.map((d: any) => {
              const createdAt = d?.created_at || d?.date || "";
              const propertyType = d?.property_type || d?.type || "-";
              const lossText = d?.loss_amount_text || d?.montant || "";
              const lossDesc = d?.loss_description || d?.description || "";
              const people = d?.people_affected ?? d?.people ?? null;
              const remarks = d?.remarks || "";
              const pieces = Array.isArray(d?.pieces) ? d.pieces : [];
              return (
                <Card key={String(d?.id ?? Math.random())} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">Déclaration de dégâts</h3>
                        {propertyType && <p className="text-sm text-muted-foreground mt-1">{propertyType}</p>}
                      </div>
                      {lossText && <Badge variant="outline">{String(lossText)}</Badge>}
                    </div>
                    {lossDesc && <p className="text-sm text-muted-foreground mb-3">{lossDesc}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{String(createdAt).replace("T", " ").replace("Z", "")}</span>
                      </div>
                      {typeof people === "number" && (
                        <div className="text-muted-foreground">
                          <span>{people} personne(s) affectée(s)</span>
                        </div>
                      )}
                      {remarks && <div className="text-muted-foreground">{remarks}</div>}
                    </div>
                    {pieces.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-2">
                        {pieces.slice(0, 6).map((u: string) => (
                          <img key={u} src={u} className="w-full h-16 object-cover rounded-md border" />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="assistance" className="space-y-3">
            {statusAss === "pending" && <p className="text-sm text-muted-foreground">Chargement…</p>}
            {errorAss && <p className="text-sm text-destructive">Impossible de charger vos demandes d’assistance.</p>}
            {statusAss === "success" && assistances.length === 0 && (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Aucune demande d’assistance trouvée.
                </CardContent>
              </Card>
            )}
            {assistances.map((a: any) => {
              const createdAt = a?.created_at || a?.date || "";
              const location = a?.location_text || a?.location || "-";
              const helpType = a?.help_type || "-";
              const people = a?.people_count ?? null;
              const phone = a?.phone || "";
              const availability = a?.availability || "";
              const urgency = a?.urgency_note || a?.details || "";
              return (
                <Card key={String(a?.id ?? Math.random())} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">Demande d’assistance</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">{String(helpType)}</Badge>
                        </div>
                      </div>
                    </div>
                    {urgency && <p className="text-sm text-muted-foreground mb-3">{urgency}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{String(location)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{String(createdAt).replace("T", " ").replace("Z", "")}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {typeof people === "number" && <span>{people} personne(s)</span>}
                        {phone && <span className="ml-3">{phone}</span>}
                        {availability && <span className="ml-3">{availability}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Historique;