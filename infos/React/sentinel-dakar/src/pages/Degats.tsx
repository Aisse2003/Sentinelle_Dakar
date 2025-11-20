import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateDegats } from "../hooks/useApi";
import { Home, FileText, Users, Upload, Camera, X, CheckCircle, Clock } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export default function Degats() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [propertyType, setPropertyType] = useState("");
  const [lossAmountText, setLossAmountText] = useState("");
  const [lossDescription, setLossDescription] = useState("");
  const [peopleAffected, setPeopleAffected] = useState<number | string>("");
  const [remarks, setRemarks] = useState("");
  const [pieces, setPieces] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [submittedPreviewUrls, setSubmittedPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { mutateAsync: createDegats, status } = useCreateDegats();
  const isSubmitting = status === "pending";
  const [submittedOk, setSubmittedOk] = useState(false);

  const addFiles = (files: File[]) => {
    const imgs = files.filter(f => f.type.startsWith('image/'));
    setPieces((prev) => {
      const next = [...prev, ...imgs].slice(0, 8);
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
      setPreviewUrls(next.map((f) => URL.createObjectURL(f)));
      return next;
    });
  };

  const removePieceAt = (i: number) => {
    setPieces((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
      setPreviewUrls(next.map((f) => URL.createObjectURL(f)));
      return next;
    });
  };

  useEffect(() => () => { previewUrls.forEach((u) => URL.revokeObjectURL(u)); }, [previewUrls]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.append('property_type', propertyType);
    form.append('loss_amount_text', lossAmountText);
    form.append('loss_description', lossDescription);
    form.append('people_affected', String(peopleAffected || 0));
    form.append('remarks', remarks);
    pieces.forEach((p) => form.append('pieces', p));
    try {
      await createDegats(form);
      try { await queryClient.invalidateQueries({ queryKey: ["degats/mes"], exact: false }); } catch {}
      // Prefetch des données pour éviter l'écran blanc sur Historique
      try {
        await queryClient.prefetchQuery({
          queryKey: ["degats/mes"],
          queryFn: async () => {
            const { data } = await axios.get('http://127.0.0.1:8000/api/degats/mes/');
            return data;
          },
        });
      } catch {}
      navigate('/historique?tab=degats', { replace: true });
      return;
    } catch {
      console.error('Degats create failed');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent">{t('damages.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('damages.subtitle')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              {t('damages.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submittedOk && (
              <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/20 text-sm">
                {t('common.success', { defaultValue: 'Votre déclaration de dégâts a été envoyée.' })}{" "}
                <Link className="underline" to="/historique?tab=degats">
                  {t('nav.history', { defaultValue: 'Voir l’historique' })}
                </Link>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propType">{t('damages.propertyType')} *</Label>
                  <Input id="propType" placeholder={t('damages.propertyExamples') as string} value={propertyType} onChange={(e)=>setPropertyType(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loss">{t('damages.loss')}</Label>
                  <Input id="loss" placeholder={t('damages.lossHint') as string} value={lossAmountText} onChange={(e)=>setLossAmountText(e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="lossDesc">{t('report.description')}</Label>
                  <Textarea id="lossDesc" rows={3} placeholder={t('report.description') as string} value={lossDescription} onChange={(e)=>setLossDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="people">{t('damages.people')}</Label>
                  <Input id="people" type="number" min={0} placeholder="0" value={peopleAffected} onChange={(e)=>setPeopleAffected(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remarks">{t('damages.remarks')}</Label>
                  <Input id="remarks" placeholder={t('damages.remarks') as string} value={remarks} onChange={(e)=>setRemarks(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('damages.proofs')}</Label>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => { e.preventDefault(); e.stopPropagation(); addFiles(Array.from(e.dataTransfer.files||[])); }}
                >
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">{t('report.dragHere')}</p>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={(e)=> addFiles(e.target.files? Array.from(e.target.files): [])} style={{ display:'none' }} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {t('report.chooseFiles')}
                  </Button>
                  {previewUrls.length > 0 ? (
                    <p className="text-xs text-muted-foreground mt-2">{previewUrls.length} {t('report.selectedCount', { count: previewUrls.length })}</p>
                  ) : null}
                </div>

                {previewUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-2">
                    {previewUrls.map((src, i) => (
                      <div key={src} className="relative group">
                        <img src={src} alt={`piece-${i}`} className="w-full h-24 object-cover rounded" />
                        <button type="button" aria-label="Supprimer" onClick={()=>removePieceAt(i)} className="absolute top-1 right-1 bg-black/60 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (<><Clock className="h-4 w-4 mr-2 animate-spin" />{t('report.sending')}</>) : (<><CheckCircle className="h-4 w-4 mr-2" />{t('damages.submit')}</>)}
              </Button>
            </form>
          </CardContent>
        </Card>

        {submittedPreviewUrls.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('damages.after')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {submittedPreviewUrls.map((src, i) => (
                  <img key={`${src}-${i}`} src={src} alt={`sent-${i}`} className="w-full h-20 object-cover rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}


