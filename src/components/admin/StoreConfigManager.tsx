
import { useState, useEffect } from 'react';
import { useStoreConfig } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const StoreConfigManager = () => {
  const { data: storeConfig, refetch } = useStoreConfig();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    store_name: '',
    logo_url: '',
    whatsapp_number: '',
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    terms_and_conditions: '',
    privacy_policy: ''
  });

  useEffect(() => {
    if (storeConfig) {
      setFormData({
        store_name: storeConfig.store_name || '',
        logo_url: storeConfig.logo_url || '',
        whatsapp_number: storeConfig.whatsapp_number || '',
        instagram_url: storeConfig.instagram_url || '',
        facebook_url: storeConfig.facebook_url || '',
        tiktok_url: storeConfig.tiktok_url || '',
        terms_and_conditions: storeConfig.terms_and_conditions || '',
        privacy_policy: storeConfig.privacy_policy || ''
      });
    }
  }, [storeConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('store_config')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', storeConfig?.id);
      
      if (error) throw error;
      
      toast({
        title: "Configuración actualizada",
        description: "La configuración de la tienda se ha actualizado correctamente.",
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al actualizar la configuración.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="store_name">Nombre de la Tienda</Label>
          <Input
            id="store_name"
            value={formData.store_name}
            onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
            placeholder="Krincesa Distribuidora"
          />
        </div>
        
        <div>
          <Label htmlFor="logo_url">URL del Logo</Label>
          <Input
            id="logo_url"
            value={formData.logo_url}
            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Información de Contacto</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="whatsapp_number">Número de WhatsApp</Label>
            <Input
              id="whatsapp_number"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              placeholder="+51999999999"
            />
            <p className="text-sm text-gray-500 mt-1">
              Número al que se enviarán los pedidos via WhatsApp
            </p>
          </div>
          
          <div>
            <Label htmlFor="instagram_url">Instagram URL</Label>
            <Input
              id="instagram_url"
              value={formData.instagram_url}
              onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
              placeholder="https://instagram.com/krincesa"
            />
          </div>
          
          <div>
            <Label htmlFor="facebook_url">Facebook URL</Label>
            <Input
              id="facebook_url"
              value={formData.facebook_url}
              onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
              placeholder="https://facebook.com/krincesa"
            />
          </div>
          
          <div>
            <Label htmlFor="tiktok_url">TikTok URL</Label>
            <Input
              id="tiktok_url"
              value={formData.tiktok_url}
              onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
              placeholder="https://tiktok.com/@krincesa"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Políticas</h3>
        
        <div>
          <Label htmlFor="terms_and_conditions">Términos y Condiciones</Label>
          <Textarea
            id="terms_and_conditions"
            value={formData.terms_and_conditions}
            onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
            rows={8}
            placeholder="Ingresa los términos y condiciones de tu tienda..."
          />
        </div>
        
        <div>
          <Label htmlFor="privacy_policy">Política de Privacidad</Label>
          <Textarea
            id="privacy_policy"
            value={formData.privacy_policy}
            onChange={(e) => setFormData({ ...formData, privacy_policy: e.target.value })}
            rows={8}
            placeholder="Ingresa la política de privacidad de tu tienda..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
          Guardar Configuración
        </Button>
      </div>
    </form>
  );
};

export default StoreConfigManager;
