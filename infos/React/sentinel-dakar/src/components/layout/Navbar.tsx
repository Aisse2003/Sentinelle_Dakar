import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Map, 
  Bell, 
  AlertTriangle, 
  BookOpen, 
  History, 
  BarChart3,
  Droplets,
  Menu,
  X,
  User,
  Shield,
  Users,
  LifeBuoy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getUserProfile } from "@/services/auth";
import { logout } from "@/services/auth";
import logo from "@/assets/logo (2).png";
import { useTranslation } from 'react-i18next';

const navigation = [
  { name: "Tableau de Bord", href: "/", icon: Home },
  { name: "Carte Interactive", href: "/carte", icon: Map },
  { name: "Alertes", href: "/alertes", icon: Bell },
  { name: "Signaler", href: "/signalement", icon: AlertTriangle },
  { name: "Dégâts", href: "/degats", icon: Droplets },
  { name: "Assistance", href: "/assistance", icon: LifeBuoy },
  { name: "Guide d'Urgence", href: "/guide", icon: BookOpen },
  { name: "Historique", href: "/historique", icon: History },
  { name: "Statistiques", href: "/stats", icon: BarChart3 },
];

export function Navbar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAuthority, setIsAuthority] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setUserName(null);
      setIsAuthority(false);
      setIsSuperuser(false);
      return;
    }
    getUserProfile()
      .then((u: any) => {
        const name = u?.name || u?.username || u?.email || null;
        setUserName(name);
        setIsAuthority(!!(u?.is_staff || u?.is_superuser));
        setIsSuperuser(!!u?.is_superuser);
      })
      .catch(() => { setUserName(null); setIsAuthority(false); setIsSuperuser(false); });
  }, [location.pathname]);

  const navItems = isAuthority
    ? [
        { name: "Autorités", href: "/autorites", icon: Users },
        { name: "Statistiques", href: "/stats", icon: BarChart3 },
      ]
    : navigation.filter((item) => item.href !== "/stats");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 md:px-8 h-16">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Sentinel Dakar" className="h-12 w-12 rounded-lg object-contain" />
          <span className="text-lg font-bold">Sentinel Dakar</span>
        </div>

        {/* Menu desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {t(({
                  '/': 'nav.dashboard',
                  '/carte': 'nav.map',
                  '/alertes': 'nav.alerts',
                  '/signalement': 'nav.report',
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
          {/* Icône Administration visible uniquement pour superuser */}
          {isSuperuser ? (
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')} title="Administration">
              <Shield className="h-5 w-5" />
            </Button>
          ) : null}
          {userName ? (
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {userName?.[0]?.toUpperCase()}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Bonjour, <span className="font-medium text-foreground">{userName}</span></span>
                <Button size="sm" variant="outline" onClick={() => { logout(); setUserName(null); navigate('/auth?tab=login'); }}>Déconnexion</Button>
              </div>
            </div>
          ) : null}
          <Button variant="ghost" size="icon" onClick={() => navigate(userName ? '/compte' : '/auth?tab=login')}>
            <User className="h-5 w-5" />
          </Button>
        </div>

        {/* Bouton mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="md:hidden bg-card border-t border-border p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {t(({
                  '/': 'nav.dashboard',
                  '/carte': 'nav.map',
                  '/alertes': 'nav.alerts',
                  '/signalement': 'nav.report',
                  '/guide': 'nav.guide',
                  '/historique': 'nav.history',
                  '/stats': 'nav.stats',
                  '/compte': 'nav.account',
                  '/autorites': 'nav.authorities'
                } as any)[item.href] || item.name)}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

