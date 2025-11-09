import React from "react";

type GeoPosition = { latitude: number; longitude: number; accuracy?: number } | null;

type GeoContextType = {
  position: GeoPosition;
  permission: PermissionState | "unknown";
  error: string | null;
  refresh: () => void;
};

const GeoContext = React.createContext<GeoContextType>({ position: null, permission: "unknown", error: null, refresh: () => {} });

export function GeolocationProvider({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = React.useState<GeoPosition>(null);
  const [permission, setPermission] = React.useState<PermissionState | "unknown">("unknown");
  const [error, setError] = React.useState<string | null>(null);
  const watchIdRef = React.useRef<number | null>(null);

  const startWatch = React.useCallback(() => {
    if (!('geolocation' in navigator)) { setError("Geolocation non supportée"); return; }
    try {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    } catch {}
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setError(null);
        setPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy });
      },
      (err) => { setError(err.message || "Erreur géolocalisation"); },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // @ts-ignore - navigator.permissions peut ne pas exister partout
        if (navigator.permissions && navigator.permissions.query) {
          // @ts-ignore
          const status = await navigator.permissions.query({ name: 'geolocation' });
          if (!cancelled) setPermission(status.state as PermissionState);
          // @ts-ignore
          status.onchange = () => setPermission(status.state as PermissionState);
        }
      } catch {}
      startWatch();
    })();
    return () => {
      cancelled = true;
      try { if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current); } catch {}
    };
  }, [startWatch]);

  const refresh = React.useCallback(() => {
    startWatch();
  }, [startWatch]);

  return (
    <GeoContext.Provider value={{ position, permission, error, refresh }}>
      {children}
    </GeoContext.Provider>
  );
}

export function useGeolocation() {
  return React.useContext(GeoContext);
}






