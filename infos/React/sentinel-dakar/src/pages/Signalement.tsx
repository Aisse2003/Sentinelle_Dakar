import { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
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
  Plus,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useGeolocation } from "@/hooks/useGeolocation.tsx";

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { position } = useGeolocation();
  const [typeIncident, setTypeIncident] = useState("");
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState("low");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submittedPreviewUrls, setSubmittedPreviewUrls] = useState<string[]>([]);
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
      alert(t('report.geolocUnsupported') as string);
    }
  };

  useEffect(() => {
    if (position && (!location || /^\s*$/.test(location))) {
      setLocation(`${position.latitude}, ${position.longitude}`);
    }
  }, [position]);

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
      // Invalider les listes d'alertes pour forcer le rechargement à l'arrivée
      try { await queryClient.invalidateQueries({ queryKey: ["alertes"], exact: false }); } catch {}
      try { await axios.get('http://127.0.0.1:8000/api/alertes/'); } catch {}
      navigate('/alertes');
      return;
    } catch (error) {
      // Ne pas afficher d'alerte intrusive en cas d'échec
      // Optionnel: journaliser l'erreur pour debug
      console.error(error);
    }
  };

  // Gestion des URLs d'aperçu pour éviter les fuites mémoire
  useEffect(() => {
    return () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewUrls]);

  const addFiles = (files: File[]) => {
    if (!files.length) return;
    setPhotos((prev) => {
      const next = [...prev, ...files].slice(0, 5);
      // recalculer les URLs d'aperçu selon next
      const nextUrls = next.map((f) => URL.createObjectURL(f));
      // révoquer les anciennes URLs
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
      setPreviewUrls(nextUrls);
      return next;
    });
  };

  const removePhotoAt = (index: number) => {
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // rebuild preview urls
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
      const nextUrls = next.map((f) => URL.createObjectURL(f));
      setPreviewUrls(nextUrls);
      return next;
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">
            {t('report.pageTitle')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('report.pageSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-primary" />
                  {t('report.newReport')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type">{t('report.type')} *</Label>
                    <select 
                      id="type" 
                      className="w-full p-3 border border-input rounded-lg bg-background"
                      value={typeIncident}
                      onChange={(e) => setTypeIncident(e.target.value)}
                      required
                    >
                      <option value="">{t('report.selectType')}</option>
                      <option value="flooding">Inondation active</option>
                      <option value="water_accumulation">Accumulation d'eau</option>
                      <option value="blocked_road">Route bloquée</option>
                      <option value="damaged_infrastructure">Infrastructure endommagée</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  {/* Localisation */}
                  <div className="space-y-2">
                    <Label htmlFor="location">{t('report.location')} *</Label>
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
                      {t('report.useMyLocation')}
                    </Button>
                  </div>

                  {/* Gravité */}
                  <div className="space-y-2">
                    <Label>{t('report.severity')} *</Label>
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
                    <Label htmlFor="description">{t('report.description')} *</Label>
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
                    <Label>{t('report.photos')}</Label>
                    <div
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
                        addFiles(files);
                      }}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('report.dragHere')}
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = e.target.files ? Array.from(e.target.files) : [];
                          addFiles(files);
                        }}
                        style={{ display: 'none' }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {t('report.chooseFiles')}
                      </Button>
                      {photos.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {t('report.selectedCount', { count: photos.length })}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {t('report.formatsHint')}
                      </p>
                    </div>

                    {/* Aperçu avant envoi */}
                    {previewUrls.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-2">
                        {previewUrls.map((src, i) => (
                          <div key={src} className="relative group">
                            <img src={src} alt={`aperçu-${i}`} className="w-full h-24 object-cover rounded" />
                            <button type="button" aria-label="Supprimer" onClick={() => removePhotoAt(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="prenom">{t('report.firstName')}</Label>
                      <Input id="prenom" placeholder="Votre prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="nom">{t('report.lastName')}</Label>
                      <Input id="nom" placeholder="Votre nom" value={nom} onChange={(e) => setNom(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="phone">{t('report.phone')}</Label>
                      <Input id="phone" placeholder="Numéro de téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>

                  {/* Bouton d'envoi */}
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        {t('report.sending')}
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        {t('report.send')}
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
      {/* Aperçu après enregistrement */}
      {submittedPreviewUrls.length > 0 && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Photos envoyées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {submittedPreviewUrls.map((src, i) => (
                  <img key={`${src}-${i}`} src={src} alt={`envoyee-${i}`} className="w-full h-20 object-cover rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default Signalement;
