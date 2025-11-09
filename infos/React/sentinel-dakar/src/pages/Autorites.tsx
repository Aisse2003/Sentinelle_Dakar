import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApi } from "../hooks/useApi";
import { Users, AlertTriangle } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function Autorites() {
  const { t } = useTranslation();
  const { data: usersData, status: usersStatus } = useApi("users");
  const { data: alertsData, status: alertsStatus } = useApi("alertes");
  const loadingUsers = usersStatus === 'pending';
  const loadingAlerts = alertsStatus === 'pending';
  const users: any[] = Array.isArray(usersData) ? usersData : [];
  const alerts: any[] = Array.isArray(alertsData) ? alertsData : [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('authorities.title')}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> {t('common.users')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsers && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
              {!loadingUsers && (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>{t('common.role')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.slice(0,50).map((u: any) => (
                        <TableRow key={String(u.id || u.pk)}>
                          <TableCell>{u.id || u.pk}</TableCell>
                          <TableCell>{u.username || u.name || '-'}</TableCell>
                          <TableCell>{u.email || '-'}</TableCell>
                          <TableCell>{u.role || u.is_staff ? 'admin' : 'user'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-danger" /> {t('common.alerts')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAlerts && <p className="text-sm text-muted-foreground">{t('common.loading')}</p>}
              {!loadingAlerts && (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>{t('common.title')}</TableHead>
                        <TableHead>Niveau</TableHead>
                        <TableHead>{t('common.status')}</TableHead>
                        <TableHead>{t('common.date')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.slice(0,50).map((a: any,i:number) => (
                        <TableRow key={String(a.id || a.pk || i)}>
                          <TableCell>{a.id || a.pk}</TableCell>
                          <TableCell>{a.title || a.titre || 'Alerte'}</TableCell>
                          <TableCell>{a.level || a.niveau || 'info'}</TableCell>
                          <TableCell>{a.status || a.etat || '-'}</TableCell>
                          <TableCell>{String(a.created_at || a.date || '').replace('T',' ').replace('Z','')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Les statistiques sont disponibles dans la page dédiée "/stats" (réservée aux autorités) */}
      </div>
    </Layout>
  );
}










