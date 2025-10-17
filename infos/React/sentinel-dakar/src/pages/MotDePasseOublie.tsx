import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { requestPasswordReset } from "@/services/auth";

export default function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError("Échec de l'envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] p-0 md:p-2 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-border p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-2">Mot de passe oublié</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Saisissez votre adresse e‑mail pour recevoir le lien de réinitialisation.
          </p>
          {sent ? (
            <p className="text-green-600">Si un compte existe, un e‑mail a été envoyé.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Votre e‑mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border p-2 rounded-lg"
              />
              <button disabled={loading} type="submit" className="w-full h-11 bg-primary text-primary-foreground rounded-lg hover:bg-primary-dark transition-smooth">
                {loading ? "Envoi..." : "Envoyer le lien"}
              </button>
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}


