import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Carte from "./pages/Carte";
import Alertes from "./pages/Alertes";
import Signalement from "./pages/Signalement";
import Degats from "./pages/Degats";
import Assistance from "./pages/Assistance";
import Guide from "./pages/Guide";
import Historique from "./pages/Historique";
import Stats from "./pages/Stats";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import MotDePasseOublie from "./pages/MotDePasseOublie";
import Compte from "./pages/Compte";
import Admin from "./pages/Admin";
import RequireAuth from "./components/auth/RequireAuth";
import RequireAuthority from "./components/auth/RequireAuthority";
import Autorites from "./pages/Autorites";
import { GeolocationProvider } from "./hooks/useGeolocation.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GeolocationProvider>
      {/* Debug overlay pour vérifier le rendu */}
      <div style={{position:'fixed',bottom:8,right:8,background:'#0008',color:'#fff',padding:'4px 8px',borderRadius:6,zIndex:9999,fontSize:12}}>
        App mounted
      </div>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />

          {/* Routes protégées */}
          <Route element={<RequireAuth />}> 
            <Route path="/" element={<Index />} />
            <Route path="/carte" element={<Carte />} />
            <Route path="/compte" element={<Compte />} />
            <Route path="/alertes" element={<Alertes />} />
            <Route path="/signalement" element={<Signalement />} />
          <Route path="/degats" element={<Degats />} />
          <Route path="/assistance" element={<Assistance />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/historique" element={<Historique />} />
            <Route path="/admin" element={<Admin />} />
            <Route element={<RequireAuthority />}>
            <Route path="/stats" element={<Stats />} />
              <Route path="/autorites" element={<Autorites />} />
            </Route>
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </GeolocationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
