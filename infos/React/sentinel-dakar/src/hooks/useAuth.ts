import { useState } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api/auth/";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Connexion utilisateur ---
  const login = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // JWT (SimpleJWT): /api/auth/token/ -> { access, refresh }
      const payload = { username: identifier, password };
      const response = await axios.post(`${API_BASE}token/`, payload, { headers: { "Content-Type": "application/json" } });
      const access = (response.data as any)?.access;
      if (!access) throw new Error("Token manquant");
      localStorage.setItem("token", access);
      setToken(access);
      setUser(null);
    } catch (e: any) {
      const apiMsg = e?.response?.data?.error || e?.response?.data?.detail || null;
      setError(apiMsg || "Échec de la connexion");
    } finally {
      setLoading(false);
    }
  };

  // --- Inscription utilisateur ---
  const register = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}register/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
    } catch (e: any) {
      let message: string | null = e?.response?.data?.error || e?.response?.data?.detail || null;
      const data = e?.response?.data;
      if (!message && data && typeof data === 'object') {
        try {
          const parts = (Object.values(data) as any[])
            .flat()
            .map((v: any) => (Array.isArray(v) ? v.join(" ") : String(v)));
          message = parts.join(" ") || null;
    } catch {
          // ignore
        }
      }
      setError(message || "Échec de l’inscription");
    } finally {
      setLoading(false);
    }
  };

  // --- Déconnexion ---
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return { user, token, loading, error, login, register, logout };
};




