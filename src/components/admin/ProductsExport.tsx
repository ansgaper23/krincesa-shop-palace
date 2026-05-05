import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ProductsExport = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const downloadJson = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, name, slug, description, brand, price, wholesale_price,
          min_wholesale_quantity, stock, image_url, additional_images,
          is_active, updated_at,
          categories ( id, name )
        `)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;

      const products = (data || []).map((p: any) => ({
        id: p.id,
        sku: p.slug,
        name: p.name,
        description: p.description,
        brand: p.brand,
        category: p.categories?.name || null,
        category_id: p.categories?.id || null,
        price_unit: Number(p.price),
        price_wholesale: Number(p.wholesale_price),
        min_wholesale_quantity: Number(p.min_wholesale_quantity),
        stock: Number(p.stock),
        image_url: p.image_url,
        images: p.additional_images || [],
        updated_at: p.updated_at,
      }));

      const body = {
        generated_at: new Date().toISOString(),
        count: products.length,
        products,
      };

      const blob = new Blob([JSON.stringify(body, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast({ title: '✅ Descargado', description: `${products.length} productos exportados` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
      <div>
        <h4 className="font-medium">Exportar productos a JSON</h4>
        <p className="text-sm text-muted-foreground">
          Descarga el catálogo en JSON y súbelo a tu repo de GitHub para que tu sistema POS lo consuma.
        </p>
      </div>
      <Button onClick={downloadJson} disabled={loading} className="gap-2">
        <Download className="h-4 w-4" />
        {loading ? 'Generando...' : 'Descargar products.json'}
      </Button>
    </div>
  );
};

export default ProductsExport;
