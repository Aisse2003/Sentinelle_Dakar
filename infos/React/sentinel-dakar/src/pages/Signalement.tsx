import { useRef, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCreateSignalement } from "../hooks/useApi";
import { 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Upload,
  CheckCircle,
  Clock,
  Eye,
  Plus
} from "lucide-react";

const recentReports = [
  {
    id: 1,
    title: "Inondation route principale",
    location: "Avenue Cheikh Anta Diop",
    status: "verified",
    time: "Il y a 15 min",
    photos: 2,
    severity: "high"
  },
  {
    id: 2,
    title: "Accumulation d'eau",
    location: "Marché de Tilène",
    status: "pending",
    time: "Il y a 1h",
    photos: 1,
    severity: "medium"
  },
  {
    id: 3,
    title: "Route impraticable",
    location: "Rond-point Jet d'Eau",
    status: "resolved",
    time: "Il y a 3h",
    photos: 3,
    severity: "low"
  }
];

const statusConfig = {
  pending: { color: "bg-warning", text: "En attente" },
  verified: { color: "bg-success", text: "Vérifié" },
  resolved: { color: "bg-primary", text: "Résolu" }
};

const Signalement = () => {
  const [typeIncident, setTypeIncident] = useState("");
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState("low");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [phone, setPhone] = useState("");
  const { mutateAsync: createSignalement, status: submitStatus } = useCreateSignalement();
  const isSubmitting = submitStatus === "pending";

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation(`${pos.coords.latitude}, ${pos.coords.longitude}`);
      });
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("type", typeIncident);
    formData.append("location", location);
    formData.append("severity", severity);
    formData.append("description", description);
    photos.forEach((photo) => formData.append("photos", photo));
    if (prenom) formData.append("prenom", prenom);
    if (nom) formData.append("nom", nom);
    if (phone) formData.append("phone", phone);

    try {
      await createSignalement(formData);
      alert("Signalement envoyé !");
      // Reset formulaire
      setTypeIncident("");
      setLocation("");
      setSeverity("low");
      setDescription("");
      setPhotos([]);
      setPrenom("");
      setNom("");
      setPhone("");
    } catch (error) {
      alert("Échec de l\'envoi du signalement. Veuillez réessayer.");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
            Signalement Citoyen
          </h1>
          <p className="text-muted-foreground mt-1">
            Aidez-nous à surveiller les inondations en signalant les incidents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-primary" />
                  Nouveau Signalement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Type d'incident *</Label>
                    <select 
                      id="type" 
                      className="w-full p-3 border border-input rounded-lg bg-background"
                      value={typeIncident}
                      onChange={(e) => setTypeIncident(e.target.value)}
                      required
                    >
                      <option value="">Sélectionnez un type</option>
                      <option value="flooding">Inondation active</option>
                      <option value="water_accumulation">Accumulation d'eau</option>
                      <option value="blocked_road">Route bloquée</option>
                      <option value="damaged_infrastructure">Infrastructure endommagée</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  {/* Localisation */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="location"
                        placeholder="Adresse ou point de repère"
                        className="pl-10"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleUseLocation}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Utiliser ma position
                    </Button>
                  </div>

                  {/* Gravité */}
                  <div className="space-y-2">
                    <Label>Niveau de gravité *</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["low", "medium", "high"].map((level) => (
                        <label key={level} className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent/50">
                          <input 
                            type="radio" 
                            name="severity" 
                            value={level} 
                            checked={severity === level}
                            onChange={() => setSeverity(level)}
                            className={
                              level === "low" ? "text-success" :
                              level === "medium" ? "text-warning" :
                              "text-danger"
                            }
                          />
                          <span className="text-sm">{level === "low" ? "Faible" : level === "medium" ? "Moyen" : "Élevé"}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea 
                      id="description"
                      placeholder="Décrivez la situation observée..."
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  {/* Upload photos */}
                  <div className="space-y-2">
                    <Label>Photos (optionnel)</Label>
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
                        if (files.length) setPhotos(prev => [...prev, ...files].slice(0, 5));
                      }}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Glissez vos photos ici ou cliquez pour sélectionner
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = e.target.files ? Array.from(e.target.files) : [];
                          if (files.length) setPhotos(prev => [...prev, ...files].slice(0, 5));
                        }}
                        style={{ display: 'none' }}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Camera className="h-4 w-4 mr-2" />
                        Choisir des fichiers
                      </Button>
                      {photos.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {photos.length} photo(s) sélectionnée(s)
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG jusqu'à 10MB - Maximum 5 photos
                      </p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom (optionnel)</Label>
                      <Input id="prenom" placeholder="Votre prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom (optionnel)</Label>
                      <Input id="nom" placeholder="Votre nom" value={nom} onChange={(e) => setNom(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone (optionnel)</Label>
                      <Input id="phone" placeholder="Numéro de téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>

                  {/* Bouton d'envoi */}
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Envoyer le signalement
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Signalements récents */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vos Signalements Récents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentReports.map((report) => {
                  const config = statusConfig[report.status];
                  return (
                    <div key={report.id} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{report.title}</h4>
                        <Badge className={`${config.color} text-white text-xs`}>{config.text}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{report.location}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{report.time}</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Camera className="h-3 w-3" />
                            <span>{report.photos}</span>
                          </div>
                          <Button size="sm" variant="ghost" className="h-6 px-2">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conseils pour un bon signalement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {["Soyez précis sur la localisation","Prenez des photos si possible","Décrivez l'impact sur la circulation","Estimez le niveau d'eau si visible"].map((tip, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>{tip}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Signalement;
