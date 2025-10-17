import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Carte from "./pages/Carte";
import Alertes from "./pages/Alertes";
import Signalement from "./pages/Signalement";
import Guide from "./pages/Guide";
import Historique from "./pages/Historique";
import Stats from "./pages/Stats";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import MotDePasseOublie from "./pages/MotDePasseOublie";
import Compte from "./pages/Compte";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Debug overlay pour vérifier le rendu */}
      <div style={{position:'fixed',bottom:8,right:8,background:'#0008',color:'#fff',padding:'4px 8px',borderRadius:6,zIndex:9999,fontSize:12}}>
        App mounted
      </div>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/carte" element={<Carte />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
          <Route path="/compte" element={<Compte />} />
          <Route path="/alertes" element={<Alertes />} />
          <Route path="/signalement" element={<Signalement />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/historique" element={<Historique />} />
          <Route path="/stats" element={<Stats />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
