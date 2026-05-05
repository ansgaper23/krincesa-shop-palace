import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Cloud } from 'lucide-react';

const R2ConfigManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [form, setForm] = useState({
    account_id: '',
    access_key_id: '',
    secret_access_key: '',
    bucket_name: '',
    public_url_base: '',
    enabled: false,
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('r2_config')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setId(data.id);
        setForm({
          account_id: data.account_id || '',
          access_key_id: data.access_key_id || '',
          secret_access_key: data.secret_access_key || '',
          bucket_name: data.bucket_name || '',
          public_url_base: data.public_url_base || '',
          enabled: !!data.enabled,
        });
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, updated_at: new Date().toISOString() };
      const res = id
        ? await supabase.from('r2_config').update(payload).eq('id', id).select().single()
        : await supabase.from('r2_config').insert([payload]).select().single();
      if (res.error) throw res.error;
      setId(res.data.id);
      toast({ title: '✅ Guardado', description: 'Credenciales R2 actualizadas' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Cargando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
        <Cloud className="h-5 w-5 mt-0.5 shrink-0" />
        <div className="text-sm space-y-1">
          <p className="font-medium">Cloudflare R2 Storage</p>
          <p className="text-muted-foreground">
            Cuando esté activo, las imágenes nuevas se subirán a R2 en lugar del almacenamiento por defecto.
            Las imágenes anteriores siguen funcionando.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div>
          <Label className="text-base">Activar R2</Label>
          <p className="text-xs text-muted-foreground">Usar Cloudflare R2 para nuevas imágenes</p>
        </div>
        <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Account ID</Label>
          <Input value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} placeholder="ej: a1b2c3d4..." />
        </div>
        <div>
          <Label>Bucket Name</Label>
          <Input value={form.bucket_name} onChange={(e) => setForm({ ...form, bucket_name: e.target.value })} placeholder="mi-bucket" />
        </div>
        <div>
          <Label>Access Key ID</Label>
          <Input value={form.access_key_id} onChange={(e) => setForm({ ...form, access_key_id: e.target.value })} />
        </div>
        <div>
          <Label>Secret Access Key</Label>
          <Input type="password" value={form.secret_access_key} onChange={(e) => setForm({ ...form, secret_access_key: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <Label>URL pública base (opcional)</Label>
          <Input
            value={form.public_url_base}
            onChange={(e) => setForm({ ...form, public_url_base: e.target.value })}
            placeholder="https://cdn.midominio.com  o  https://pub-xxxx.r2.dev"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Si tienes dominio custom o public dev URL, ponlo aquí. Si lo dejas vacío, se usará pub-[account_id].r2.dev
          </p>
        </div>
      </div>

      <Button onClick={save} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar credenciales'}
      </Button>
    </div>
  );
};

export default R2ConfigManager;
