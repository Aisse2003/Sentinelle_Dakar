import { useEffect, useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import logo from "@/assets/logo (2).png";
import { useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

export default function Auth() {
  const location = useLocation();
  const [tab, setTab] = useState<"login" | "register">("login");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = (params.get("tab") || "").toLowerCase();
    if (q === "register") setTab("register");
    else setTab("login");
  }, [location.search]);

  return (
    <Layout hideFooter>
      <div className="min-h-[calc(100vh-8rem)] p-0 md:p-2 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="Sentinel Dakar" className="h-16 w-16 rounded-2xl object-contain shadow-depth" />
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">Sentinel Dakar</h1>
            <p className="text-sm text-muted-foreground">Accès et création de compte</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-border">
            <div className="grid grid-cols-2">
              <button
                className={`py-3 font-medium rounded-tl-2xl ${tab === "login" ? "bg-primary text-primary-foreground" : "bg-transparent"}`}
                onClick={() => setTab("login")}
              >
                Connexion
              </button>
              <button
                className={`py-3 font-medium rounded-tr-2xl ${tab === "register" ? "bg-primary text-primary-foreground" : "bg-transparent"}`}
                onClick={() => setTab("register")}
              >
                Inscription
              </button>
            </div>
            <div className="p-4 md:p-6">
              {tab === "login" ? <LoginForm showHeader={false} /> : <RegisterForm showHeader={false} />}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


