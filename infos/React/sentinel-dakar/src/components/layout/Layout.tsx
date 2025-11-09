import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { SideNav } from "./SideNav";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
  hideNavbar?: boolean;
}

export function Layout({ children, hideFooter = false, hideNavbar = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar en haut */}
      {/* Barre latérale gauche */}
      {!hideNavbar && <SideNav />}

      {/* Contenu principal */}
      <main className={hideNavbar ? "flex-1 pt-0" : "flex-1"}>
        <div className={hideNavbar ? "p-4 md:p-6" : "p-4 md:p-6 md:ml-64 ml-64"}>{children}</div>
      </main>
    </div>
  );
}
