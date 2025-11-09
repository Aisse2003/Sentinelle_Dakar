import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserProfile } from "@/services/auth";

export default function RequireAuthority() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          if (!cancelled) setAllowed(false);
          return;
        }
        const me = await getUserProfile();
        const isAuthority = !!(me?.is_staff || me?.is_superuser);
        if (!cancelled) setAllowed(isAuthority);
      } catch {
        if (!cancelled) setAllowed(false);
      }
    };
    check();
    return () => { cancelled = true; };
  }, []);

  if (allowed === null) {
    return <div style={{padding:16}}>Chargement…</div>;
  }
  if (!allowed) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}




