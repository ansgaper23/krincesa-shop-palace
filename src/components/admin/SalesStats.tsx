import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Package, DollarSign } from 'lucide-react';

interface ProductSalesStats {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  stock: number;
  total_sold: number;
  total_revenue: number;
  order_count: number;
}

export const SalesStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['sales-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_sales_stats')
        .select('*')
        .limit(5);
      
      if (error) throw error;
      return data as ProductSalesStats[];
    }
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando estadísticas...</div>;
  }

  const topProducts = stats?.slice(0, 3) || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats?.reduce((sum, p) => sum + Number(p.total_sold), 0) || 0}
            </p>
            <p className="text-xs text-muted-foreground">Unidades vendidas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${(stats?.reduce((sum, p) => sum + Number(p.total_revenue), 0) || 0).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">Total generado</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Con ventas</p>
          </CardContent>
        </Card>
      </div>

      {topProducts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top 3 Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full font-bold text-sm">
                  {index + 1}
                </div>
                {product.image_url && (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.total_sold} vendidos • ${Number(product.total_revenue).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Stock</p>
                  <p className={`text-sm font-semibold ${product.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>
                    {product.stock}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
