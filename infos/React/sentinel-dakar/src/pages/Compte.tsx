import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router-dom";
import { getUserProfile, logout } from "@/services/auth";

export default function Compte() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return <Navigate to="/auth?tab=login" replace />;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getUserProfile();
        if (!cancelled) { setUser(me); setLoading(false); }
      } catch {
        if (!cancelled) { setUser(null); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mon compte</h1>
            <p className="text-muted-foreground">Informations de votre profil et paramètres.</p>
          </div>
          <Button variant="outline" onClick={() => { logout(); window.location.href = "/auth?tab=login"; }}>Se déconnecter</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Chargement…</p>
            ) : user ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nom d’utilisateur</p>
                  <p className="font-medium">{user.username || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{user.email || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Prénom</p>
                  <p className="font-medium">{user.first_name || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Nom</p>
                  <p className="font-medium">{user.last_name || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rôle</p>
                  <p className="font-medium">{user.is_superuser ? "Superuser" : (user.is_staff ? "Autorité" : "Citoyen")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ID utilisateur</p>
                  <p className="font-medium">{String(user.id ?? "-")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Statut du compte</p>
                  <p className="font-medium">{user.is_active ? "Actif" : "Inactif"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dernière connexion</p>
                  <p className="font-medium">{user.last_login ? String(user.last_login).replace("T"," ").replace("Z","") : "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date d’inscription</p>
                  <p className="font-medium">{user.date_joined ? String(user.date_joined).replace("T"," ").replace("Z","") : "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">Groupes</p>
                  <p className="font-medium">{Array.isArray(user.groups) && user.groups.length ? user.groups.join(", ") : "-"}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-destructive">Impossible de charger votre profil.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}


