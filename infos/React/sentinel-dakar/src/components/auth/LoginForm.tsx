import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export default function LoginForm({ showHeader = true }: { showHeader?: boolean }) {
  const { login, error, loading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(identifier, password);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-6 md:p-8 bg-white rounded-2xl shadow-lg space-y-4 border border-border">
      {showHeader && (
        <div className="flex flex-col items-center">
          <h2 className="mt-1 text-2xl md:text-3xl font-extrabold text-foreground">Se connecter</h2>
          <p className="text-sm text-muted-foreground">Accédez à votre compte</p>
        </div>
      )}

      <input
        name="identifier"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="Email ou nom d’utilisateur"
        className="w-full border p-2 rounded-lg"
      />
      <input
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        className="w-full border p-2 rounded-lg"
      />
      <button type="submit" disabled={loading} className="w-full h-11 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-smooth">
        {loading ? "Connexion..." : "Se connecter"}
      </button>
      <p className="text-sm text-muted-foreground text-center">
        <Link to="/mot-de-passe-oublie" className="text-primary font-medium">Mot de passe oublié ?</Link>
      </p>
      {error && <p className="text-red-500 text-center">{error}</p>}
    </form>
  );
}


