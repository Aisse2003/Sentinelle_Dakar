import { Mail, MapPin, Phone, Droplets } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-r from-white to-secondary text-foreground">
      {/* Motif gouttes d'eau en surimpression */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10px 10px, rgba(0,0,0,0.06) 2px, transparent 2.5px), radial-gradient(circle at 26px 26px, rgba(0,0,0,0.04) 1.5px, transparent 2px)",
          backgroundSize: "36px 36px",
          backgroundPosition: "0 0, 18px 18px",
        }}
      />
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Haut : Newsletter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-8 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Restez informé</h2>
            <p className="text-muted-foreground">
              Recevez en temps réel les alertes d’inondation, prévisions météo et conseils de sécurité.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="px-4 py-2 rounded-l-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none w-72"
            />
            <button className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-r-lg text-primary-foreground">
              S'abonner
            </button>
          </div>
        </div>

        {/* Bas : Infos et Liens */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo + Infos */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Droplets className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-bold">Sentinel Dakar</h3>
                <p className="text-sm text-muted-foreground">Surveillance inondations</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Plateforme officielle de suivi et d’alerte pour les inondations à Dakar.
              Visualisez les zones à risque et recevez des notifications personnalisées.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+221 33 XXX XX XX</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>sentinel.dakar@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Dakar, Sénégal</span>
              </li>
            </ul>
          </div>

          {/* Fonctionnalités */}
          <div>
            <h4 className="font-semibold mb-3">Fonctionnalités</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li><a href="#">Carte interactive</a></li>
              <li><a href="#">Alertes en temps réel</a></li>
              <li><a href="#">Signalement citoyen</a></li>
              <li><a href="#">Itinéraires alternatifs</a></li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="font-semibold mb-3">Ressources</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li><a href="#">Guide d’urgence</a></li>
              <li><a href="#">Historique des alertes</a></li>
              <li><a href="#">Statistiques</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>

          {/* Régions */}
          <div>
            <h4 className="font-semibold mb-3">Zones couvertes</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li><a href="#">Dakar</a></li>
              <li><a href="#">Pikine</a></li>
              <li><a href="#">Guédiawaye</a></li>
              <li><a href="#">Rufisque</a></li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-primary">🌐</a>
              <a href="#" className="hover:text-primary">🐦</a>
              <a href="#" className="hover:text-primary">📷</a>
              <a href="#" className="hover:text-primary">💼</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
