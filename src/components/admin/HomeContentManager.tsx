import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUpload } from './ImageUpload';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useProducts';
import { Trash2, Plus, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ICON_OPTIONS = ['sparkles', 'shield', 'truck', 'heart', 'star', 'gift', 'package', 'tag'];

// Generic editor for any of the home tables
type EditorMode = 'hero_slides' | 'promo_banners' | 'featured_categories' | 'benefits';

const HomeContentManager = () => {
  return (
    <Tabs defaultValue="hero_slides" className="space-y-4">
      <TabsList className="flex flex-wrap h-auto">
        <TabsTrigger value="hero_slides">Slides</TabsTrigger>
        <TabsTrigger value="featured_categories">Categorías destacadas</TabsTrigger>
        <TabsTrigger value="promo_banners">Banners promocionales</TabsTrigger>
        <TabsTrigger value="benefits">Beneficios</TabsTrigger>
      </TabsList>
      <TabsContent value="hero_slides"><GenericList mode="hero_slides" /></TabsContent>
      <TabsContent value="featured_categories"><GenericList mode="featured_categories" /></TabsContent>
      <TabsContent value="promo_banners"><GenericList mode="promo_banners" /></TabsContent>
      <TabsContent value="benefits"><GenericList mode="benefits" /></TabsContent>
    </Tabs>
  );
};

const GenericList = ({ mode }: { mode: EditorMode }) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: categories } = useCategories();

  const { data: items = [], isLoading } = useQuery({
    queryKey: [mode, 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase.from(mode).select('*').order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async (row: any) => {
      const { id, ...rest } = row;
      if (id) {
        const { error } = await supabase.from(mode).update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(mode).insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [mode] });
      qc.invalidateQueries({ queryKey: [mode.replace('_', '-')] });
      toast({ title: '✅ Guardado' });
    },
    onError: (e: any) => toast({ title: '❌ Error', description: e.message, variant: 'destructive' }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(mode).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [mode] });
      qc.invalidateQueries({ queryKey: [mode.replace('_', '-')] });
      toast({ title: '🗑️ Eliminado' });
    },
  });

  const blank = (): any => {
    const base = { display_order: items.length, is_active: true };
    if (mode === 'benefits') return { ...base, icon: 'sparkles', title: '', description: '' };
    if (mode === 'featured_categories') return { ...base, image_url: '', category_id: null, custom_name: '' };
    if (mode === 'hero_slides') return { ...base, image_url: '', title: '', button_text: 'Comprar ahora', link_url: '' };
    return { ...base, image_url: '', title: '', button_text: 'Ver más', link_url: '' };
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="space-y-4">
      <Button onClick={() => upsert.mutate(blank())} className="gap-2">
        <Plus className="h-4 w-4" /> Agregar
      </Button>

      {items.length === 0 && <p className="text-sm text-muted-foreground">No hay elementos. Agrega uno.</p>}

      {items.map((item: any) => (
        <ItemEditor
          key={item.id}
          item={item}
          mode={mode}
          categories={categories || []}
          onSave={(row) => upsert.mutate(row)}
          onDelete={() => remove.mutate(item.id)}
        />
      ))}
    </div>
  );
};

const ItemEditor = ({ item, mode, categories, onSave, onDelete }: any) => {
  const [draft, setDraft] = useState(item);
  const set = (k: string, v: any) => setDraft({ ...draft, [k]: v });

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch checked={draft.is_active} onCheckedChange={(v) => set('is_active', v)} />
            <span className="text-sm">{draft.is_active ? 'Activo' : 'Inactivo'}</span>
          </div>
          <div className="flex gap-2">
            <Label className="flex items-center gap-2 text-xs">
              Orden
              <Input
                type="number"
                value={draft.display_order ?? 0}
                onChange={(e) => set('display_order', parseInt(e.target.value || '0'))}
                className="w-20 h-8"
              />
            </Label>
            <Button size="sm" variant="outline" onClick={() => onSave(draft)} className="gap-1">
              <Save className="h-3.5 w-3.5" /> Guardar
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {(mode === 'hero_slides' || mode === 'promo_banners' || mode === 'featured_categories') && (
          <ImageUpload value={draft.image_url || ''} onChange={(url) => set('image_url', url)} label="Imagen" />
        )}

        {mode === 'featured_categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Categoría</Label>
              <Select value={draft.category_id || ''} onValueChange={(v) => set('category_id', v)}>
                <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                <SelectContent>
                  {categories.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nombre a mostrar (opcional)</Label>
              <Input value={draft.custom_name || ''} onChange={(e) => set('custom_name', e.target.value)} />
            </div>
          </div>
        )}

        {(mode === 'hero_slides' || mode === 'promo_banners') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Título</Label>
              <Input value={draft.title || ''} onChange={(e) => set('title', e.target.value)} />
            </div>
            <div>
              <Label>Texto del botón</Label>
              <Input value={draft.button_text || ''} onChange={(e) => set('button_text', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Enlace (URL o ruta como /)</Label>
              <Input value={draft.link_url || ''} onChange={(e) => set('link_url', e.target.value)} placeholder="https://... o /" />
            </div>
          </div>
        )}

        {mode === 'benefits' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Ícono</Label>
              <Select value={draft.icon || 'sparkles'} onValueChange={(v) => set('icon', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Título</Label>
              <Input value={draft.title || ''} onChange={(e) => set('title', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Descripción</Label>
              <Input value={draft.description || ''} onChange={(e) => set('description', e.target.value)} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HomeContentManager;
