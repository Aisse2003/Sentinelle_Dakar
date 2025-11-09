import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Bell, Clock, MapPin } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { data, status } = useApi('signalements');
  const loading = status === 'pending';
  const items: any[] = Array.isArray(data) ? data.slice(0, 20) : [];

  return (
    <>
      <button aria-label="Notifications" className="h-9 w-9 rounded-md border flex items-center justify-center" onClick={() => setOpen(true)}>
        <Bell className="h-4 w-4" />
      </button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Notifications</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-2 max-h-[70vh] overflow-auto">
            {loading && <p className="text-sm text-muted-foreground">Chargement...</p>}
            {!loading && items.length === 0 && <p className="text-sm text-muted-foreground">Aucune notification pour le moment.</p>}
            {items.map((s, i) => (
              <div key={s.id || i} className="p-3 rounded-md border">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Bell className="h-4 w-4 text-primary" />
                  Signalement citoyen
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {s.description || '—'}
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{String(s.created_at || s.date || '').replace('T',' ').replace('Z','')}</span>
                  {s.location_text && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location_text}</span>}
                </div>
              </div>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default NotificationCenter;




