import { useEffect, useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import logo from "@/assets/logo (2).png";
import hero from "@/assets/flood.jpg";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useTranslation } from 'react-i18next';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");
  const { t } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = (params.get("tab") || "").toLowerCase();
    if (q === "register") setTab("register");
    else setTab("login");
  }, [location.search]);

  return (
    <Layout hideFooter hideNavbar>
      <div className="relative min-h-screen">
        <img src={hero} alt="Sentinel Dakar" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/60" />
        <div className="relative min-h-screen flex items-center justify-center p-6">
          {/* Lien inscription en haut à droite */}
              <button
            className="absolute top-6 right-6 text-sm text-primary-foreground/90 hover:text-white"
            onClick={() => navigate('/auth?tab=register')}
              >
            {t('auth.createNew')}
              </button>

          <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-6 md:p-8">
            <div className="flex items-center justify-start mb-4">
              <img src={logo} alt="Sentinel Dakar" className="h-12 w-12 rounded-2xl object-contain shadow-depth" />
            </div>
            <h1 className="text-3xl font-bold text-left mb-6">{tab === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}</h1>
              {tab === "login" ? <LoginForm showHeader={false} /> : <RegisterForm showHeader={false} />}
          </div>
        </div>
      </div>
    </Layout>
  );
}


