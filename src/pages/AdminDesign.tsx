import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useStoreConfig } from '@/hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ChevronLeft, Palette, Layers, Type, MousePointer2, Layout, Save } from 'lucide-react';
import { ColorsPanel } from '@/components/admin/design/ColorsPanel';
import { TypographyPanel } from '@/components/admin/design/TypographyPanel';
import { ButtonsPanel } from '@/components/admin/design/ButtonsPanel';
import { SectionsPanel } from '@/components/admin/design/SectionsPanel';
import { ThemesPanel } from '@/components/admin/design/ThemesPanel';

const TABS = [
  { id: 'themes', label: 'Temas', icon: Layout, Component: ThemesPanel },
  { id: 'sections', label: 'Secciones', icon: Layers, Component: SectionsPanel },
  { id: 'colors', label: 'Colores', icon: Palette, Component: ColorsPanel },
  { id: 'typography', label: 'Tipografía', icon: Type, Component: TypographyPanel },
  { id: 'buttons', label: 'Botones', icon: MousePointer2, Component: ButtonsPanel },
] as const;

const AdminDesign = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [openTab, setOpenTab] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const { data: storeConfig } = useStoreConfig();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return navigate('/admin/login');
      supabase.from('user_roles').select('role').eq('user_id', session.user.id).eq('role', 'admin').single().then(({ data }) => {
        if (!data) return navigate('/');
        setAuthed(true);
      });
    });
  }, [navigate]);

  useEffect(() => {
    if (storeConfig) setDraft({ ...storeConfig });
  }, [storeConfig]);

  // Live preview: post message to iframe whenever draft changes
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage({ type: 'design-preview', payload: draft }, '*');
  }, [draft]);

  const handleIframeLoad = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'design-preview', payload: draft }, '*');
  };

  const update = (patch: any) => setDraft((d: any) => ({ ...d, ...patch }));

  const save = async () => {
    setSaving(true);
    const { id, created_at, updated_at, ...rest } = draft;
    const { error } = await supabase.from('store_config').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', id);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: '✅ Guardado' });
      qc.invalidateQueries({ queryKey: ['store-config'] });
    }
  };

  if (!authed) return <div className="min-h-screen flex items-center justify-center">Verificando acceso...</div>;

  const ActiveComponent = TABS.find((t) => t.id === openTab)?.Component;
  const previewSrc = '/?design_preview=1';

  return (
    <div className="fixed inset-0 bg-slate-100 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b shrink-0">
        <Link to="/admin" className="flex items-center gap-2 text-sm font-medium hover:text-primary">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-semibold">Diseña tu página web</h1>
        <Button size="sm" onClick={save} disabled={saving} className="gap-2 rounded-full">
          <Save className="h-4 w-4" />
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      {/* Device toggle */}
      <div className="flex justify-center gap-2 py-2 bg-white border-b shrink-0">
        <Button size="sm" variant={device === 'mobile' ? 'default' : 'outline'} onClick={() => setDevice('mobile')} className="rounded-full text-xs h-7 px-3">📱 Móvil</Button>
        <Button size="sm" variant={device === 'desktop' ? 'default' : 'outline'} onClick={() => setDevice('desktop')} className="rounded-full text-xs h-7 px-3">🖥️ Escritorio</Button>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-hidden flex items-start justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-lg overflow-hidden border transition-all"
          style={{
            width: device === 'mobile' ? 390 : '100%',
            maxWidth: device === 'desktop' ? 1200 : 390,
            height: '100%',
          }}
        >
          <iframe
            ref={iframeRef}
            src={previewSrc}
            onLoad={handleIframeLoad}
            className="w-full h-full border-0"
            title="Preview"
          />
        </div>
      </div>

      {/* Bottom dock */}
      <div className="bg-white border-t shrink-0 safe-bottom">
        <div className="grid grid-cols-5">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = openTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setOpenTab(active ? null : t.id)}
                className={`flex flex-col items-center gap-0.5 py-2.5 transition-colors ${active ? 'text-primary' : 'text-slate-600'}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[11px] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side sheet for active panel */}
      <Sheet open={!!openTab} onOpenChange={(o) => !o && setOpenTab(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{TABS.find((t) => t.id === openTab)?.label}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {ActiveComponent && <ActiveComponent draft={draft} update={update} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminDesign;
