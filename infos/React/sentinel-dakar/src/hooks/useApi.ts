import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// --- Requête GET générique ---
async function fetchFromApi(endpoint: string, params?: Record<string, any>) {
  const token = localStorage.getItem("token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(`${API_BASE_URL}/${endpoint}/`, { headers, params });
  return response.data;
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
      const response = await axios.post(`${API_BASE_URL}/${endpoint}/`, data, { headers });
      return response.data;
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
      const response = await axios.post(`${API_BASE_URL}/signalements/`, payload, { headers });
      return response.data;
    },
    onError: (error: AxiosError) => {
      console.error("Erreur API:", error.response?.data || error.message);
    },
  });
}
