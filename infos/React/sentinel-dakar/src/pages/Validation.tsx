import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/hooks/useApi";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { alertAreaPushBySignalement, alertAreaSmsBySignalement } from "@/services/notifications";

type SignalementItem = {
  id: number;
  description?: string;
  severity?: string;
  location_text?: string;
  created_at?: string;
  status?: "pending" | "verified" | "resolved";
  photos?: string[];
};

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function Validation() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"pending" | "verified" | "resolved">("pending");
  const { data, status, refetch } = useApi("signalements", { status: tab });
  const loading = status === "pending";
  const rows: SignalementItem[] = Array.isArray(data) ? data : [];

  useEffect(() => {
    // refetch when tab changes
    void refetch();
  }, [tab]);

  async function withAuthPost(url: string) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await axios.post(url, {}, { headers });
  }

  const columns = useMemo(() => [
    { key: "id", label: "ID", render: (r: SignalementItem) => r.id },
    { key: "severity", label: t("report.severity"), render: (r: SignalementItem) => (r.severity || "-") },
    { key: "location_text", label: t("report.location"), render: (r: SignalementItem) => (r.location_text || "-") },
    { key: "created_at", label: t("common.date"), render: (r: SignalementItem) => String(r.created_at || "").replace("T", " ").replace("Z", "") },
    { key: "description", label: t("report.description"), render: (r: SignalementItem) => (r.description || "-") },
    { key: "photos", label: t("report.photos"), render: (r: SignalementItem) => (r.photos && r.photos.length ? `${r.photos.length}` : "0") },
  ], [t]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Validation des signalements</h1>
          <Badge variant="secondary">{rows.length} éléments</Badge>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("common.filter", { defaultValue: "Filtrer" })}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="pending">En attente</TabsTrigger>
                <TabsTrigger value="verified">Vérifiés</TabsTrigger>
                <TabsTrigger value="resolved">Résolus</TabsTrigger>
              </TabsList>
              <TabsContent value="pending" className="space-y-2">
                <SignalementsTable
                  rows={rows}
                  loading={loading}
                  onValidate={async (id) => { await withAuthPost(`${API_BASE_URL}/signalements/${id}/validate/`); await refetch(); }}
                  onResolve={async (id) => { await withAuthPost(`${API_BASE_URL}/signalements/${id}/resolve/`); await refetch(); }}
                  actionMode="pending"
                  columns={columns}
                />
              </TabsContent>
              <TabsContent value="verified" className="space-y-2">
                <SignalementsTable
                  rows={rows}
                  loading={loading}
                  onValidate={null}
                  onResolve={async (id) => { await withAuthPost(`${API_BASE_URL}/signalements/${id}/resolve/`); await refetch(); }}
                  actionMode="verified"
                  columns={columns}
                />
              </TabsContent>
              <TabsContent value="resolved" className="space-y-2">
                <SignalementsTable
                  rows={rows}
                  loading={loading}
                  onValidate={null}
                  onResolve={null}
                  actionMode="resolved"
                  columns={columns}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function SignalementsTable({
  rows,
  loading,
  onValidate,
  onResolve,
  actionMode,
  columns,
}: {
  rows: SignalementItem[];
  loading: boolean;
  onValidate: ((id: number) => Promise<void>) | null;
  onResolve: ((id: number) => Promise<void>) | null;
  actionMode: "pending" | "verified" | "resolved";
  columns: Array<{ key: string; label: string | any; render: (r: SignalementItem) => any }>;
}) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (<TableHead key={c.key}>{c.label}</TableHead>))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={columns.length + 1}><span className="text-sm text-muted-foreground">Chargement…</span></TableCell>
            </TableRow>
          )}
          {!loading && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length + 1}><span className="text-sm text-muted-foreground">Aucun élément</span></TableCell>
            </TableRow>
          )}
          {!loading && rows.map((r) => (
            <TableRow key={r.id}>
              {columns.map((c) => (<TableCell key={c.key}>{c.render(r)}</TableCell>))}
              <TableCell className="space-x-2">
                {actionMode === "pending" && (
                  <>
                    {onValidate && <Button size="sm" variant="outline" onClick={() => onValidate(r.id)}>Valider</Button>}
                    {onResolve && <Button size="sm" onClick={() => onResolve(r.id)}>Résoudre</Button>}
                    <Button size="sm" variant="secondary" onClick={async () => { await alertAreaPushBySignalement(r.id, { title: "Alerte locale", body: "Risque élevé dans votre quartier." }); }}>
                      Notifier quartier
                    </Button>
                    <Button size="sm" variant="ghost" onClick={async () => { await alertAreaSmsBySignalement(r.id, { body: "Alerte inondation dans votre quartier" }); }}>
                      SMS quartier
                    </Button>
                  </>
                )}
                {actionMode === "verified" && onResolve && (
                  <>
                    <Button size="sm" onClick={() => onResolve(r.id)}>Résoudre</Button>
                    <Button size="sm" variant="secondary" onClick={async () => { await alertAreaPushBySignalement(r.id, { title: "Alerte locale", body: "Risque élevé dans votre quartier." }); }}>
                      Notifier quartier
                    </Button>
                    <Button size="sm" variant="ghost" onClick={async () => { await alertAreaSmsBySignalement(r.id, { body: "Alerte inondation dans votre quartier" }); }}>
                      SMS quartier
                    </Button>
                  </>
                )}
                {actionMode === "resolved" && (
                  <Badge variant="secondary">Terminé</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


