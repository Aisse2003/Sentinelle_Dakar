import { Layout } from "@/components/layout/Layout";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Navigate } from "react-router-dom";

export default function Compte() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return <Navigate to="/auth?tab=login" replace />;
  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Mon compte</h1>
        <p className="text-muted-foreground">Informations de votre profil et paramètres.</p>
      </div>
    </Layout>
  );
}


