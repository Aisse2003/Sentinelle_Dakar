const API_BASE_URL = "http://127.0.0.1:8000/api";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    return reg;
  } catch {
    return null;
  }
}

async function getVapidPublicKey(): Promise<string | null> {
  // 1) Essayer via env Vite
  const envKey = (import.meta as any)?.env?.VITE_VAPID_PUBLIC_KEY;
  if (envKey && typeof envKey === "string" && envKey.trim()) return envKey.trim();
  // 2) Fallback: interroger le backend
  try {
    const res = await fetch("http://127.0.0.1:8000/api/notifications/vapid-public-key/");
    const json = await res.json().catch(() => ({}));
    const k = json?.publicKey;
    if (k && typeof k === "string" && k.trim()) return k.trim();
  } catch {
    // ignore
  }
  return null;
}

export async function subscribePush(reg: ServiceWorkerRegistration, vapidPublicKey?: string) {
  if (!("pushManager" in reg)) throw new Error("Push non supporté");
  let key = vapidPublicKey;
  if (!key) key = await getVapidPublicKey() || undefined;
  if (!key) throw new Error("Clé VAPID manquante");
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key),
  });
  return sub;
}

export async function saveSubscription(sub: PushSubscription) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/subscribe/`, {
      method: "POST",
      headers,
      body: JSON.stringify(sub),
    });
    return await res.json().catch(() => ({}));
  } catch (e) {
    return null;
  }
}

export type NotificationPrefs = {
  inApp: boolean;
  webPush: boolean;
  sms: boolean;
};

const PREFS_KEY = "notifPrefs";

export function loadPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { inApp: true, webPush: false, sms: false };
    const parsed = JSON.parse(raw);
    return { inApp: true, webPush: !!parsed.webPush, sms: !!parsed.sms };
  } catch {
    return { inApp: true, webPush: false, sms: false };
  }
}

export function savePrefs(p: NotificationPrefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(p));
}

export async function sendTestNotification(channels: NotificationPrefs) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/test/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ channels }),
    });
    return await res.json().catch(() => ({}));
  } catch (e) {
    return null;
  }
}

export async function updatePresence(payload: { endpoint: string; lat?: number; lng?: number; locality?: string }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/presence/`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    return await res.json().catch(() => ({}));
  } catch (e) {
    return null;
  }
}

export async function alertAreaPushBySignalement(signalementId: number, opt?: { title?: string; body?: string; radius_km?: number }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/alert-area/push/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ signalement_id: signalementId, ...opt }),
    });
    return await res.json().catch(() => ({}));
  } catch (e) {
    return null;
  }
}

export async function alertAreaSmsBySignalement(signalementId: number, opt?: { body?: string; radius_km?: number }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/alert-area/sms/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ signalement_id: signalementId, ...opt }),
    });
    return await res.json().catch(() => ({}));
  } catch (e) {
    return null;
  }
}


