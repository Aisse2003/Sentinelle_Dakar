import { Navigate, Outlet, useLocation } from "react-router-dom";

export function RequireAuth() {
  const location = useLocation();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    return <Navigate to="/auth?tab=login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default RequireAuth;



