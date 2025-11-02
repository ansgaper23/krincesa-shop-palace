import { useState, useEffect } from 'react';
import { useStoreConfig } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { ImageUpload } from './ImageUpload';

const StoreConfigManager = () => {
  const { data: storeConfig } = useStoreConfig();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    store_name: '',
    logo_url: '',
    email: '',
    whatsapp_number: '',
    instagram_url: '',
    facebook_url: '',
    tiktok_url: '',
    terms_and_conditions: '',
    privacy_policy: '',
    site_description: '',
    whatsapp_message_template: '',
    primary_color: '#e91e8c',
    header_bg_color: '#ffffff',
    header_text_color: '#000000',
    footer_bg_color: '#f8f9fa',
    footer_text_color: '#6c757d',
    product_title_color: '#1a1a1a',
    product_price_color: '#e91e8c',
    button_text_color: '#ffffff'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (storeConfig) {
      console.log('Store config loaded:', storeConfig);
      setFormData({
        store_name: storeConfig.store_name || '',
        logo_url: storeConfig.logo_url || '',
        email: storeConfig.email || '',
        whatsapp_number: storeConfig.whatsapp_number || '',
        instagram_url: storeConfig.instagram_url || '',
        facebook_url: storeConfig.facebook_url || '',
        tiktok_url: storeConfig.tiktok_url || '',
        terms_and_conditions: storeConfig.terms_and_conditions || '',
        privacy_policy: storeConfig.privacy_policy || '',
        site_description: storeConfig.site_description || '',
        whatsapp_message_template: storeConfig.whatsapp_message_template || '',
        primary_color: storeConfig.primary_color || '#e91e8c',
        header_bg_color: storeConfig.header_bg_color || '#ffffff',
        header_text_color: storeConfig.header_text_color || '#000000',
        footer_bg_color: storeConfig.footer_bg_color || '#f8f9fa',
        footer_text_color: storeConfig.footer_text_color || '#6c757d',
        product_title_color: storeConfig.product_title_color || '#1a1a1a',
        product_price_color: storeConfig.product_price_color || '#e91e8c',
        button_text_color: storeConfig.button_text_color || '#ffffff'
      });
    }
  }, [storeConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.store_name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la tienda es obligatorio.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting store config:', formData);
    
    try {
      const updateData = {
        store_name: formData.store_name.trim(),
        logo_url: formData.logo_url.trim() || null,
        email: formData.email.trim() || null,
        whatsapp_number: formData.whatsapp_number.trim() || null,
        instagram_url: formData.instagram_url.trim() || null,
        facebook_url: formData.facebook_url.trim() || null,
        tiktok_url: formData.tiktok_url.trim() || null,
        terms_and_conditions: formData.terms_and_conditions.trim() || null,
        privacy_policy: formData.privacy_policy.trim() || null,
        site_description: formData.site_description.trim() || null,
        whatsapp_message_template: formData.whatsapp_message_template.trim() || null,
        primary_color: formData.primary_color,
        header_bg_color: formData.header_bg_color,
        header_text_color: formData.header_text_color,
        footer_bg_color: formData.footer_bg_color,
        footer_text_color: formData.footer_text_color,
        product_title_color: formData.product_title_color,
        product_price_color: formData.product_price_color,
        button_text_color: formData.button_text_color,
        updated_at: new Date().toISOString()
      };

      // First check if any config exists
      const { data: existingConfigs, error: selectError } = await supabase
        .from('store_config')
        .select('id')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (selectError) {
        console.error('Error checking existing config:', selectError);
        throw selectError;
      }

      let result;
      if (existingConfigs && existingConfigs.length > 0) {
        // Update existing config
        console.log('Updating existing config with ID:', existingConfigs[0].id);
        result = await supabase
          .from('store_config')
          .update(updateData)
          .eq('id', existingConfigs[0].id)
          .select()
          .single();
      } else {
        // Create new config
        console.log('Creating new config');
        result = await supabase
          .from('store_config')
          .insert([updateData])
          .select()
          .single();
      }
      
      console.log('Operation result:', result);
      
      if (result.error) {
        console.error('Supabase error:', result.error);
        throw result.error;
      }
      
      if (result.data) {
        toast({
          title: "Configuración guardada",
          description: "La configuración de la tienda se ha guardado correctamente.",
        });
        
        // Clear all cache and force refresh
        await queryClient.clear();
        await queryClient.invalidateQueries({ queryKey: ['store-config'] });
        
        // Force page refresh to ensure all components update
        window.location.reload();
      } else {
        throw new Error('No se recibieron datos de la operación');
      }
      
    } catch (error: any) {
      console.error('Error updating store config:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un error al guardar la configuración.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="store_name">Nombre de la Tienda *</Label>
          <Input
            id="store_name"
            value={formData.store_name}
            onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
            placeholder="Krincesa Distribuidora"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="info@krincesa.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="site_description">Descripción del Sitio Web</Label>
        <Textarea
          id="site_description"
          value={formData.site_description}
          onChange={(e) => setFormData({ ...formData, site_description: e.target.value })}
          rows={3}
          placeholder="Tu tienda de confianza para productos de belleza y accesorios."
        />
      </div>

      <div>
        <ImageUpload
          value={formData.logo_url}
          onChange={(url) => setFormData({ ...formData, logo_url: url })}
          label="Logo de la Tienda"
        />
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
        <h3 className="text-lg font-semibold text-gray-800">Mensajes de WhatsApp</h3>
        
        <div>
          <Label htmlFor="whatsapp_message_template">Plantilla de Mensaje de Pedido</Label>
          <Textarea
            id="whatsapp_message_template"
            value={formData.whatsapp_message_template}
            onChange={(e) => setFormData({ ...formData, whatsapp_message_template: e.target.value })}
            rows={10}
            placeholder="NUEVO PEDIDO&#10;&#10;Cliente: {{customer_name}}&#10;Telefono: {{customer_phone}}&#10;&#10;Productos:&#10;{{products_list}}&#10;&#10;Total: S/ {{total_amount}}&#10;&#10;Notas: {{notes}}&#10;&#10;Gracias por tu preferencia!"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Variables disponibles: {"{"}{"{"} customer_name {"}"}{"}"}, {"{"}{"{"} customer_phone {"}"}{"}"}, {"{"}{"{"} province {"}"}{"}"}, {"{"}{"{"} products_list {"}"}{"}"}, {"{"}{"{"} total_amount {"}"}{"}"}, {"{"}{"{"} notes {"}"}{"}"}
          </p>
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
            rows={6}
            placeholder="Ingresa los términos y condiciones de tu tienda..."
          />
        </div>
        
        <div>
          <Label htmlFor="privacy_policy">Política de Privacidad</Label>
          <Textarea
            id="privacy_policy"
            value={formData.privacy_policy}
            onChange={(e) => setFormData({ ...formData, privacy_policy: e.target.value })}
            rows={6}
            placeholder="Ingresa la política de privacidad de tu tienda..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Personalización de Colores</h3>
        <p className="text-sm text-muted-foreground">Personaliza los colores de tu tienda</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="primary_color">Color Primario (Botones)</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="primary_color"
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                placeholder="#e91e8c"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="button_text_color">Color de Texto de Botones</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="button_text_color"
                type="color"
                value={formData.button_text_color}
                onChange={(e) => setFormData({ ...formData, button_text_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={formData.button_text_color}
                onChange={(e) => setFormData({ ...formData, button_text_color: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="header_bg_color">Color de Fondo del Encabezado</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="header_bg_color"
                type="color"
                value={formData.header_bg_color}
                onChange={(e) => setFormData({ ...formData, header_bg_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={formData.header_bg_color}
                onChange={(e) => setFormData({ ...formData, header_bg_color: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="header_text_color">Color de Texto del Encabezado</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="header_text_color"
                type="color"
                value={formData.header_text_color}
                onChange={(e) => setFormData({ ...formData, header_text_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={formData.header_text_color}
                onChange={(e) => setFormData({ ...formData, header_text_color: e.target.value })}
                placeholder="#000000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="footer_bg_color">Color de Fondo del Pie de Página</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="footer_bg_color"
                type="color"
                value={formData.footer_bg_color}
                onChange={(e) => setFormData({ ...formData, footer_bg_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={formData.footer_bg_color}
                onChange={(e) => setFormData({ ...formData, footer_bg_color: e.target.value })}
                placeholder="#f8f9fa"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="footer_text_color">Color de Texto del Pie de Página</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="footer_text_color"
                type="color"
                value={formData.footer_text_color}
                onChange={(e) => setFormData({ ...formData, footer_text_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={formData.footer_text_color}
                onChange={(e) => setFormData({ ...formData, footer_text_color: e.target.value })}
                placeholder="#6c757d"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="product_title_color">Color de Títulos de Productos</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="product_title_color"
                type="color"
                value={formData.product_title_color}
                onChange={(e) => setFormData({ ...formData, product_title_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={formData.product_title_color}
                onChange={(e) => setFormData({ ...formData, product_title_color: e.target.value })}
                placeholder="#1a1a1a"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="product_price_color">Color de Precios de Productos</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="product_price_color"
                type="color"
                value={formData.product_price_color}
                onChange={(e) => setFormData({ ...formData, product_price_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                type="text"
                value={formData.product_price_color}
                onChange={(e) => setFormData({ ...formData, product_price_color: e.target.value })}
                placeholder="#e91e8c"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          className="bg-pink-500 hover:bg-pink-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </form>
  );
};

export default StoreConfigManager;
