import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateAssistance } from "../hooks/useApi";
import { MapPin, Phone, LifeBuoy, Clock, AlertTriangle } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useGeolocation } from "@/hooks/useGeolocation.tsx";

export default function Assistance() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { position } = useGeolocation();
  const [location, setLocation] = useState("");
  const [helpType, setHelpType] = useState("rescue");
  const [peopleCount, setPeopleCount] = useState<string|number>("");
  const [phone, setPhone] = useState("");
  const [availability, setAvailability] = useState("");
  const [urgency, setUrgency] = useState("");
  const { mutateAsync: createAssistance, status } = useCreateAssistance();
  const isSubmitting = status === 'pending';
  const [submittedOk, setSubmittedOk] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation(`${pos.coords.latitude}, ${pos.coords.longitude}`);
    });
  };

  // Préremplir si vide
  useEffect(() => {
    if (position && (!location || /^\s*$/.test(location))) {
      setLocation(`${position.latitude}, ${position.longitude}`);
    }
  }, [position]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAssistance({
        location_text: location,
        help_type: helpType,
        people_count: Number(peopleCount || 0),
        phone,
        availability,
        urgency_note: urgency,
      });
      try { await queryClient.invalidateQueries({ queryKey: ["assistance/mes"], exact: false }); } catch {}
      // Prefetch des données d'historique pour éviter l'écran blanc
      try {
        await queryClient.prefetchQuery({
          queryKey: ["assistance/mes"],
          queryFn: async () => {
            const { data } = await axios.get('http://127.0.0.1:8000/api/assistance/mes/');
            return data;
          },
        });
      } catch {}
      navigate('/historique?tab=assistance', { replace: true });
      return;
    } catch {
      // Optionnel: feedback discret
      console.error('Assistance create failed');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">{t('assistance.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('assistance.subtitle')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LifeBuoy className="h-5 w-5 mr-2 text-primary" />
              {t('assistance.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submittedOk && (
              <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-sm">
                {t('common.success', { defaultValue: 'Votre demande a été envoyée avec succès.' })}{" "}
                <Link className="underline" to="/historique?tab=assistance">
                  {t('nav.history', { defaultValue: 'Voir l’historique' })}
                </Link>
              </div>
            )}
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loc">{t('assistance.location')} *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="loc" className="pl-10" placeholder="14.7167, -17.4677 ou adresse" value={location} onChange={(e)=>setLocation(e.target.value)} required />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={useMyLocation} className="mt-2">
                    <MapPin className="h-4 w-4 mr-2" /> {t('report.useMyLocation')}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t('assistance.helpType')} *</Label>
                  <select id="type" className="w-full p-3 border border-input rounded-lg bg-background" value={helpType} onChange={(e)=>setHelpType(e.target.value)} required>
                    <option value="rescue">{t('assistance.helpOptions.rescue')}</option>
                    <option value="lodging">{t('assistance.helpOptions.lodging')}</option>
                    <option value="food">{t('assistance.helpOptions.food')}</option>
                    <option value="transport">{t('assistance.helpOptions.transport')}</option>
                    <option value="medical">{t('assistance.helpOptions.medical')}</option>
                    <option value="other">{t('assistance.helpOptions.other')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="people">{t('assistance.people')}</Label>
                  <Input id="people" type="number" min={0} placeholder="0" value={peopleCount} onChange={(e)=>setPeopleCount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('assistance.phone')} *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" className="pl-10" placeholder="77 000 00 00" value={phone} onChange={(e)=>setPhone(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">{t('assistance.availability')}</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="availability" className="pl-10" placeholder="Ex: disponible 24h/24, urgence élevée" value={availability} onChange={(e)=>setAvailability(e.target.value)} />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="urgency">{t('assistance.details')}</Label>
                  <Textarea id="urgency" rows={3} placeholder="Détails utiles pour les secours" value={urgency} onChange={(e)=>setUrgency(e.target.value)} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (<><Clock className="h-4 w-4 mr-2 animate-spin" />{t('report.sending')}</>) : (<><AlertTriangle className="h-4 w-4 mr-2" />{t('assistance.submit')}</>)}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}


