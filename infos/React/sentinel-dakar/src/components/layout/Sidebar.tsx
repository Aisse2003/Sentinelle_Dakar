import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Map, 
  Bell, 
  AlertTriangle, 
  BookOpen, 
  History, 
  BarChart3, 
  Menu, 
  X, 
  Droplets
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface NavbarProps {
  className?: string;
}

const navigation = [
  { name: "Tableau de Bord", href: "/", icon: Home },
  { name: "Carte Interactive", href: "/carte", icon: Map },
  { name: "Alertes", href: "/alertes", icon: Bell },
  { name: "Signaler", href: "/signalement", icon: AlertTriangle },
  { name: "Guide d'Urgence", href: "/guide", icon: BookOpen },
  { name: "Historique", href: "/historique", icon: History },
  { name: "Statistiques", href: "/stats", icon: BarChart3 },
];

export function Navbar({ className }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Navbar principale */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b border-border bg-card shadow-sm",
          className
        )}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="rounded-lg bg-gradient-to-br from-primary to-primary-light p-2">
                <Droplets className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Sentinel</h1>
                <p className="text-xs text-muted-foreground">Dakar</p>
              </div>
            </div>

            {/* Bouton mobile */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

            {/* Menu Desktop */}
            <div className="hidden md:flex space-x-6">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center text-sm font-medium transition-colors",
                      isActive
                        ? "text-primary border-b-2 border-primary pb-1"
                        : "text-muted-foreground hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Menu Mobile */}
        {isOpen && (
          <div className="md:hidden border-t border-border bg-card p-4 space-y-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              );
            })}
          </div>
        )}
      </nav>

      {/* Décalage du contenu pour ne pas être caché derrière la navbar */}
      <div className="h-16"></div>
    </>
  );
}
