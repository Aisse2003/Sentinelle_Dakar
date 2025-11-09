import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// --- Requête GET générique ---
async function fetchFromApi(endpoint: string, params?: Record<string, any>) {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  try {
    const response = await axios.get(`${API_BASE_URL}/${endpoint}/`, { headers, params });
    return response.data;
  } catch (err: any) {
    // Si token invalide -> purger et réessayer sans auth
    if (token && err?.response?.status === 401) {
      try {
        localStorage.removeItem("token");
        // supprimer l'en-tête global par défaut avant de retenter
        try { delete (axios.defaults.headers as any).common?.Authorization; } catch {}
        const response = await axios.get(`${API_BASE_URL}/${endpoint}/`, { params });
        return response.data;
      } catch (e) {
        throw e;
      }
    }
    throw err;
  }
}

// --- Hook GET ---
export function useApi(endpoint: string, params?: Record<string, any>) {
  return useQuery({
    queryKey: [endpoint, params],
    queryFn: () => fetchFromApi(endpoint, params),
  });
}

// --- Hook POST générique (FormData ou JSON) ---
export function usePostApi(endpoint: string) {
  return useMutation({
    mutationFn: async (data: unknown) => {
      const token = localStorage.getItem("token");
      const headers = token
        ? { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        : { "Content-Type": "multipart/form-data" };
      try {
        const response = await axios.post(`${API_BASE_URL}/${endpoint}/`, data, { headers });
        return response.data;
      } catch (err: any) {
        if (token && err?.response?.status === 401) {
          localStorage.removeItem("token");
          try { delete (axios.defaults.headers as any).common?.Authorization; } catch {}
          const response = await axios.post(`${API_BASE_URL}/${endpoint}/`, data, { headers: { "Content-Type": "multipart/form-data" } });
          return response.data;
        }
        throw err;
      }
    },
    onError: (error: AxiosError) => {
      console.error("Erreur API:", error.response?.data || error.message);
    },
  });
}

// Spécifique: signalements (POST JSON ou FormData)
export function useCreateSignalement() {
  return useMutation({
    mutationFn: async (data: FormData | Record<string, any>) => {
      const token = localStorage.getItem("token");
      const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      // Laisser le navigateur définir le boundary pour FormData
      if (!isFormData) headers["Content-Type"] = "application/json";
      const payload = isFormData ? data : JSON.stringify(data);
      try {
        const response = await axios.post(`${API_BASE_URL}/signalements/`, payload, { headers });
        return response.data;
      } catch (err: any) {
        if (token && err?.response?.status === 401) {
          localStorage.removeItem("token");
          try { delete (axios.defaults.headers as any).common?.Authorization; } catch {}
          const fallbackHeaders: Record<string, string> = isFormData ? {} : { "Content-Type": "application/json" };
          const response = await axios.post(`${API_BASE_URL}/signalements/`, payload, { headers: fallbackHeaders });
          return response.data;
        }
        throw err;
      }
    },
    onError: (error: AxiosError) => {
      console.error("Erreur API:", error.response?.data || error.message);
    },
  });
}

// Spécifique: déclarations de dégâts (POST FormData ou JSON)
export function useCreateDegats() {
  return useMutation({
    mutationFn: async (data: FormData | Record<string, any>) => {
      const token = localStorage.getItem("token");
      const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      if (!isFormData) headers["Content-Type"] = "application/json";
      const payload = isFormData ? data : JSON.stringify(data);
      try {
        const response = await axios.post(`${API_BASE_URL}/degats/`, payload, { headers });
        return response.data;
      } catch (err: any) {
        if (token && err?.response?.status === 401) {
          localStorage.removeItem("token");
          try { delete (axios.defaults.headers as any).common?.Authorization; } catch {}
          const fallbackHeaders: Record<string, string> = isFormData ? {} : { "Content-Type": "application/json" };
          const response = await axios.post(`${API_BASE_URL}/degats/`, payload, { headers: fallbackHeaders });
          return response.data;
        }
        throw err;
      }
    },
    onError: (error: AxiosError) => {
      console.error("Erreur API:", error.response?.data || error.message);
    },
  });
}

// Demande d'assistance (POST JSON ou FormData)
export function useCreateAssistance() {
  return useMutation({
    mutationFn: async (data: FormData | Record<string, any>) => {
      const token = localStorage.getItem("token");
      const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      if (!isFormData) headers["Content-Type"] = "application/json";
      const payload = isFormData ? data : JSON.stringify(data);
      try {
        const response = await axios.post(`${API_BASE_URL}/assistance/`, payload, { headers });
        return response.data;
      } catch (err: any) {
        if (token && err?.response?.status === 401) {
          localStorage.removeItem("token");
          try { delete (axios.defaults.headers as any).common?.Authorization; } catch {}
          const fallbackHeaders: Record<string, string> = isFormData ? {} : { "Content-Type": "application/json" };
          const response = await axios.post(`${API_BASE_URL}/assistance/`, payload, { headers: fallbackHeaders });
          return response.data;
        }
        throw err;
      }
    },
    onError: (error: AxiosError) => {
      console.error("Erreur API:", error.response?.data || error.message);
    },
  });
}
