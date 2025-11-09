import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home,
  Map,
  Bell,
  AlertTriangle,
  BookOpen,
  History,
  BarChart3,
  User,
  Droplets,
  Users,
  LifeBuoy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { getUserProfile, logout as apiLogout } from "@/services/auth";
import logo from "@/assets/logo (2).png";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

const baseNavigation = [
  { name: "Tableau de Bord", href: "/", icon: Home },
  { name: "Carte Interactive", href: "/carte", icon: Map },
  { name: "Alertes", href: "/alertes", icon: Bell },
  { name: "Signaler", href: "/signalement", icon: AlertTriangle },
  { name: "Dégâts", href: "/degats", icon: Droplets },
  { name: "Assistance", href: "/assistance", icon: LifeBuoy },
  { name: "Guide d'Urgence", href: "/guide", icon: BookOpen },
  { name: "Historique", href: "/historique", icon: History },
  { name: "Compte", href: "/compte", icon: User },
];

export function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isAuthority, setIsAuthority] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) { if (!cancelled) setIsAuthority(false); return; }
        const me = await getUserProfile();
        if (!cancelled) setIsAuthority(!!(me?.is_staff || me?.is_superuser));
      } catch {
        if (!cancelled) setIsAuthority(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [location.pathname]);

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-card border-r border-border hidden md:flex flex-col">
      <div className="h-16 px-4 flex items-center gap-2 border-b border-border">
        <img src={logo} alt="Sentinel Dakar" className="h-12 w-12 rounded-lg object-contain" />
        <span className="text-lg font-bold">Sentinel Dakar</span>
      </div>
      <nav className="flex-1 overflow-auto p-3 space-y-1">
        {(isAuthority
          ? [
              { name: "Autorités", href: "/autorites", icon: Users },
              { name: "Statistiques", href: "/stats", icon: BarChart3 },
            ]
          : baseNavigation
        ).map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon as any;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t(({
                '/': 'nav.dashboard',
                '/carte': 'nav.map',
                '/alertes': 'nav.alerts',
                '/signalement': 'nav.report',
              '/degats': 'damages.nav',
                '/assistance': 'assistance.nav',
                '/guide': 'nav.guide',
                '/historique': 'nav.history',
                '/stats': 'nav.stats',
                '/compte': 'nav.account',
                '/autorites': 'nav.authorities'
              } as any)[item.href] || item.name)}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button size="sm" variant={i18n.language==='fr'? 'default':'outline'} onClick={()=>{ i18n.changeLanguage('fr'); localStorage.setItem('lang','fr'); }}>FR</Button>
            <Button size="sm" variant={i18n.language==='wo'? 'default':'outline'} onClick={()=>{ i18n.changeLanguage('wo'); localStorage.setItem('lang','wo'); }}>WO</Button>
          </div>
          {isAuthority ? <NotificationCenter /> : null}
        </div>
        <Button className="w-full" variant="outline" onClick={() => { apiLogout(); navigate('/auth?tab=login'); }}>Se déconnecter</Button>
      </div>
    </aside>
  );
}

export default SideNav;


