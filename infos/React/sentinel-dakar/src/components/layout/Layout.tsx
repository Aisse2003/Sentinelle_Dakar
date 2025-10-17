import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export function Layout({ children, hideFooter = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar en haut */}
      <Navbar />

      {/* Contenu principal */}
      <main className="flex-1 pt-16">
        <div className="p-4 md:p-6">{children}</div>
      </main>

      {/* Footer en bas */}
      {!hideFooter && <Footer />}
    </div>
  );
}
