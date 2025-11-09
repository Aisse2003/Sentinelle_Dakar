import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Bell, Users, Building2, Trash2, Pencil, Plus } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { useMemo, useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sparkline } from "@/components/charts/Sparkline";
import { useRealtime } from "@/hooks/useRealtime";

export default function Admin() {
  const { t } = useTranslation();
  const { data: alertes } = useApi("alertes");
  const { data: signalements } = useApi("signalements");
  const { data: infrastructures } = useApi("infrastructures");

  const totalAlertes = Array.isArray(alertes) ? alertes.length : 0;
  const totalSignalements = Array.isArray(signalements) ? signalements.length : 0;

  // Temps réel: fait bouger les KPI de façon légère
  const { lastEvent } = useRealtime("http://127.0.0.1:8000/api/realtime/stream");
  const [kpiAlertes, setKpiAlertes] = useState<number>(totalAlertes);
  const [kpiSignalements, setKpiSignalements] = useState<number>(totalSignalements);

  useEffect(() => {
    setKpiAlertes(totalAlertes);
  }, [totalAlertes]);

  useEffect(() => {
    setKpiSignalements(totalSignalements);
  }, [totalSignalements]);

  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === "alert") setKpiAlertes((n) => n + 1);
    else if (lastEvent.type === "report" || lastEvent.type === "metric") setKpiSignalements((n) => n + 1);
  }, [lastEvent]);
  const totalInfras = Array.isArray(infrastructures) ? infrastructures.length : 0;

  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [period, setPeriod] = useState<"7j"|"30j"|"90j">("30j");

  const filteredAlertes = useMemo(() => {
    if (!Array.isArray(alertes)) return [];
    const q = query.trim().toLowerCase();
    const maxAgeDays = period === "7j" ? 7 : period === "90j" ? 90 : 30;
    const now = new Date();
    const minDate = new Date(now);
    minDate.setDate(now.getDate() - maxAgeDays);
    const inPeriod = (d: any) => {
      const s = String(d || "");
      const dt = new Date(s);
      return isFinite(dt.getTime()) ? dt >= minDate : true;
    };
    return alertes.filter((a: any) => {
      const matchesText = !q || String(a.title || a.titre || a.message || "").toLowerCase().includes(q);
      const lvl = String(a.level || a.niveau || "").toLowerCase();
      const st = String(a.status || a.etat || "").toLowerCase();
      const matchesLevel = !level || lvl.includes(level.toLowerCase());
      const matchesStatus = !status || st.includes(status.toLowerCase());
      const dateSrc = a.created_at || a.date || a.time;
      const matchesPeriod = inPeriod(dateSrc);
      return matchesText && matchesLevel && matchesStatus && matchesPeriod;
    });
  }, [alertes, query, level, status, period]);

  // Sparkline data from signalements (30j)
  const [sparkData, setSparkData] = useState<number[]>([]);
  useEffect(() => {
    if (!Array.isArray(signalements)) return;
    const byDay: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      byDay[d.toISOString().slice(0,10)] = 0;
    }
    for (const s of signalements) {
      const k = String(s.created_at || s.date || s.time || "").slice(0,10);
      if (byDay[k] !== undefined) byDay[k] += 1;
    }
    setSparkData(Object.values(byDay));
  }, [signalements]);

  // CSV Export
  const exportCsv = () => {
    const rows = [["id","title","level","status","location","created_at"]];
    for (const a of filteredAlertes) {
      rows.push([
        String(a.id || a.pk || ""),
        String(a.title || a.titre || ""),
        String(a.level || a.niveau || ""),
        String(a.status || a.etat || ""),
        String(a.location || a.localisation || a.location_text || ""),
        String(a.created_at || a.date || a.time || ""),
      ]);
    }
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `alertes_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // CRUD modals (UI only)
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<null|any>(null);
  const [openDelete, setOpenDelete] = useState<null|any>(null);
  const [form, setForm] = useState({ title: "", level: "info", status: "active", message: "", location: "" });
  const resetForm = () => setForm({ title: "", level: "info", status: "active", message: "", location: "" });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('admin.title', { defaultValue: 'Administration' })}</h1>
            <p className="text-sm text-muted-foreground">{t('admin.subtitle', { defaultValue: 'Vue d’ensemble et gestion des entités.' })}</p>
          </div>
        </div>

        {/* KPIs + Micro chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('common.alerts')}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiAlertes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('stats.reports', { defaultValue: 'Signalements' })}</CardTitle>
              <Bell className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiSignalements}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('admin.infrastructures', { defaultValue: 'Infrastructures' })}</CardTitle>
              <Building2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInfras}</div>
            </CardContent>
          </Card>
        </div>
        <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">{t('admin.trendReports30', { defaultValue: 'Tendance des signalements (30j)' })}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Sparkline data={sparkData.length? sparkData : Array.from({length:30},(_,i)=>Math.round(10+Math.sin(i/3)*3))} height={80} />
          </CardContent>
        </Card>

        {/* Alertes - gestion rapide */}
        <Card>
            <CardHeader className="flex items-center justify-between">
            <CardTitle>{t('common.alerts')}</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder={(t('common.search') as string) + '...'} value={query} onChange={(e) => setQuery(e.target.value)} />
              <select className="border rounded-md p-2 bg-background" value={level} onChange={(e)=>setLevel(e.target.value)}>
                <option value="">{t('alerts.levelAll', { defaultValue: 'Niveau: Tous' })}</option>
                <option value="critical">{t('alerts.levelCritical', { defaultValue: 'Critique' })}</option>
                <option value="high">{t('alerts.levelHigh', { defaultValue: 'Élevé' })}</option>
                <option value="medium">{t('alerts.levelMedium', { defaultValue: 'Moyen' })}</option>
                <option value="low">{t('alerts.levelLow', { defaultValue: 'Faible' })}</option>
                <option value="info">{t('alerts.levelInfo', { defaultValue: 'Info' })}</option>
              </select>
              <select className="border rounded-md p-2 bg-background" value={status} onChange={(e)=>setStatus(e.target.value)}>
                <option value="">{t('admin.statusAll', { defaultValue: 'Statut: Tous' })}</option>
                <option value="active">{t('admin.statusActive', { defaultValue: 'Actives' })}</option>
                <option value="resolved">{t('admin.statusResolved', { defaultValue: 'Résolues' })}</option>
                <option value="archived">{t('admin.statusArchived', { defaultValue: 'Archivées' })}</option>
              </select>
              <div className="flex items-center rounded-md border bg-background text-sm">
                {["7j","30j","90j"].map(p => (
                  <button key={p} className={`px-2 py-1 ${p===period? 'bg-primary text-primary-foreground':'hover:bg-accent'}`} onClick={()=>setPeriod(p as any)}>{p}</button>
                ))}
              </div>
              <Button variant="outline" onClick={exportCsv}>{t('stats.exportCsv', { defaultValue: 'Export CSV' })}</Button>
              <Button onClick={()=>{ resetForm(); setOpenCreate(true); }}><Plus className="h-4 w-4 mr-1"/>{t('admin.newAlert', { defaultValue: 'Nouvelle alerte' })}</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Id</TableHead>
                    <TableHead>{t('common.title')}</TableHead>
                    <TableHead>{t('alerts.level', { defaultValue: 'Niveau' })}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>{t('admin.createdAt', { defaultValue: 'Créée' })}</TableHead>
                    <TableHead className="text-right">{t('common.actions', { defaultValue: 'Actions' })}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(filteredAlertes) && filteredAlertes.slice(0, 10).map((a: any) => (
                    <TableRow key={String(a.id || a.pk)}>
                      <TableCell>{a.id || a.pk}</TableCell>
                      <TableCell>{a.title || a.titre || "-"}</TableCell>
                      <TableCell>{a.level || a.niveau || "info"}</TableCell>
                      <TableCell>{a.status || a.etat || "active"}</TableCell>
                      <TableCell>{String(a.created_at || a.date || "").replace("T"," ").replace("Z", "")}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={()=>setOpenEdit(a)}><Pencil className="h-3 w-3 mr-1"/>{t('common.edit', { defaultValue: 'Modifier' })}</Button>
                        <Button size="sm" variant="destructive" className="ml-2" onClick={()=>setOpenDelete(a)}><Trash2 className="h-3 w-3 mr-1"/>{t('common.delete', { defaultValue: 'Supprimer' })}</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Signalements - aperçu */}
        <Card>
            <CardHeader className="flex items-center justify-between">
            <CardTitle>{t('admin.recentReports', { defaultValue: 'Signalements récents' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Id</TableHead>
                    <TableHead>{t('common.alerts')}</TableHead>
                    <TableHead>{t('map.locate')}</TableHead>
                    <TableHead>{t('common.date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(signalements) && signalements.slice(0, 10).map((s: any) => (
                    <TableRow key={String(s.id || s.pk)}>
                      <TableCell>{s.id || s.pk}</TableCell>
                      <TableCell>{s.alerte_id || s.alert_id || "-"}</TableCell>
                      <TableCell>{s.location || s.localisation || s.location_text || "-"}</TableCell>
                      <TableCell>{String(s.created_at || s.date || "").replace("T"," ").replace("Z", "")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('admin.newAlert', { defaultValue: 'Nouvelle alerte' })}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder={t('common.title') as string} value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} />
            <Input placeholder={t('alerts.message', { defaultValue: 'Message' }) as string} value={form.message} onChange={(e)=>setForm({...form, message: e.target.value})} />
            <Input placeholder={t('map.locate') as string} value={form.location} onChange={(e)=>setForm({...form, location: e.target.value})} />
            <div className="flex gap-2">
              <select className="border rounded-md p-2 flex-1" value={form.level} onChange={(e)=>setForm({...form, level: e.target.value})}>
                <option value="critical">Critique</option>
                <option value="high">Élevé</option>
                <option value="medium">Moyen</option>
                <option value="low">Faible</option>
                <option value="info">Info</option>
              </select>
              <select className="border rounded-md p-2 flex-1" value={form.status} onChange={(e)=>setForm({...form, status: e.target.value})}>
                <option value="active">Active</option>
                <option value="resolved">Résolue</option>
                <option value="archived">Archivée</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpenCreate(false)}>{t('common.cancel', { defaultValue: 'Annuler' })}</Button>
            <Button onClick={()=>{ console.log("create", form); setOpenCreate(false); }}>{t('common.save', { defaultValue: 'Enregistrer' })}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!openEdit} onOpenChange={(o)=> setOpenEdit(o? openEdit : null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('admin.editAlert', { defaultValue: 'Modifier l’alerte' })}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder={t('common.title') as string} defaultValue={openEdit?.title || openEdit?.titre} onChange={(e)=> setOpenEdit({ ...openEdit, title: e.target.value })} />
            <Input placeholder={t('alerts.message', { defaultValue: 'Message' }) as string} defaultValue={openEdit?.message || ""} onChange={(e)=> setOpenEdit({ ...openEdit, message: e.target.value })} />
            <Input placeholder={t('map.locate') as string} defaultValue={openEdit?.location || openEdit?.localisation || ""} onChange={(e)=> setOpenEdit({ ...openEdit, location: e.target.value })} />
            <div className="flex gap-2">
              <select className="border rounded-md p-2 flex-1" defaultValue={openEdit?.level || openEdit?.niveau || "info"} onChange={(e)=> setOpenEdit({ ...openEdit, level: e.target.value })}>
                <option value="critical">Critique</option>
                <option value="high">Élevé</option>
                <option value="medium">Moyen</option>
                <option value="low">Faible</option>
                <option value="info">Info</option>
              </select>
              <select className="border rounded-md p-2 flex-1" defaultValue={openEdit?.status || openEdit?.etat || "active"} onChange={(e)=> setOpenEdit({ ...openEdit, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="resolved">Résolue</option>
                <option value="archived">Archivée</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpenEdit(null)}>{t('common.cancel', { defaultValue: 'Annuler' })}</Button>
            <Button onClick={()=>{ console.log("edit", openEdit); setOpenEdit(null); }}>{t('common.save', { defaultValue: 'Enregistrer' })}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={!!openDelete} onOpenChange={(o)=> setOpenDelete(o? openDelete : null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('admin.deleteAlert', { defaultValue: 'Supprimer l’alerte' })}</DialogTitle></DialogHeader>
          <p>{t('admin.confirmDelete', { defaultValue: 'Confirmer la suppression de l’alerte' })} #{String(openDelete?.id || openDelete?.pk)} ?</p>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpenDelete(null)}>{t('common.cancel', { defaultValue: 'Annuler' })}</Button>
            <Button variant="destructive" onClick={()=>{ console.log("delete", openDelete); setOpenDelete(null); }}>{t('common.delete', { defaultValue: 'Supprimer' })}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}


