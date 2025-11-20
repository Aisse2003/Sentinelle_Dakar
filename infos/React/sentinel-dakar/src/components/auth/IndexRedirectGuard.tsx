import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUserProfile } from "@/services/auth";

export default function IndexRedirectGuard({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<"unknown" | "authority" | "user">("unknown");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          if (!cancelled) setRole("user");
          return;
        }
        const me = await getUserProfile();
        const isAuthority = !!(me?.is_staff || me?.is_superuser);
        if (!cancelled) setRole(isAuthority ? "authority" : "user");
      } catch {
        if (!cancelled) setRole("user");
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (role === "unknown") {
    return null;
  }
  if (role === "authority") {
    return <Navigate to="/autorites" replace />;
  }
  return <>{children}</>;
}


