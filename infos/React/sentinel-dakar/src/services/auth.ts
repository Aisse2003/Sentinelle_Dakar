import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export interface LoginPayload { username?: string; email?: string; password: string }
export interface RegisterPayload { username: string; email: string; first_name: string; last_name: string; password: string }

export async function login(payload: LoginPayload) {
  const { data } = await axios.post(`${API_BASE_URL}/auth/login/`, payload);
  return data; // attendu: { token: string, user?: any }
}

export async function register(payload: RegisterPayload) {
  const { data } = await axios.post(`${API_BASE_URL}/auth/register/`, payload);
  return data; // attendu: { token: string, user?: any }
}

export async function getUserProfile() {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const { data } = await axios.get(`${API_BASE_URL}/auth/user/`, { headers });
  return data;
}

export function setAuthToken(token?: string) {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
}

// init au chargement
const existing = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
if (existing) setAuthToken(existing);

export function logout() {
  setAuthToken(undefined);
}

export async function requestPasswordReset(email: string) {
  const { data } = await axios.post(`${API_BASE_URL}/auth/password-reset/`, { email });
  return data;
}

export async function confirmPasswordReset(payload: { uid: string; token: string; new_password: string }) {
  const { data } = await axios.post(`${API_BASE_URL}/auth/password-reset/confirm/`, payload);
  return data;
}


