
import { useState } from 'react';
import { useAllProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQueryClient } from '@tanstack/react-query';
import ProductForm from './ProductForm';
import { Card, CardContent } from '@/components/ui/card';

const ProductsManager = () => {
  const { data: products, refetch: refetchProducts } = useAllProducts();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const invalidateQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['products'] });
    await queryClient.invalidateQueries({ queryKey: ['all-products'] });
    await queryClient.refetchQueries({ queryKey: ['products'] });
    await queryClient.refetchQueries({ queryKey: ['all-products'] });
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente.",
      });
      
      await invalidateQueries();
      await refetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un error al eliminar el producto.",
        variant: "destructive",
      });
    }
  };

  const toggleProductStatus = async (product: any) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);
      
      if (error) throw error;
      
      toast({
        title: product.is_active ? "Producto desactivado" : "Producto activado",
        description: `El producto se ha ${product.is_active ? 'desactivado' : 'activado'} correctamente.`,
      });
      
      await invalidateQueries();
      await refetchProducts();
    } catch (error: any) {
      console.error('Error updating product status:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un error al actualizar el producto.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Lista de Productos</h2>
        <Button onClick={handleNew} className="bg-pink-500 hover:bg-pink-600 w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Mobile view */}
      <div className="block md:hidden space-y-4">
        {products?.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  {product.brand && (
                    <p className="text-xs text-gray-500 truncate">{product.brand}</p>
                  )}
                  <div className="mt-1 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span>Precio:</span>
                      <span className="font-medium">S/ {product.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>Por mayor:</span>
                      <span className="font-medium">S/ {product.wholesale_price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleProductStatus(product)}
                        className="h-8 w-8 p-0"
                      >
                        {product.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop view */}
      <div className="hidden md:block border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Precio Mayor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium max-w-[150px] truncate">{product.name}</TableCell>
                <TableCell className="max-w-[100px] truncate">{product.brand || '-'}</TableCell>
                <TableCell>S/ {product.price.toFixed(2)}</TableCell>
                <TableCell>S/ {product.wholesale_price.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleProductStatus(product)}
                      title={product.is_active ? 'Desactivar producto' : 'Activar producto'}
                    >
                      {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ProductForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        editingProduct={editingProduct}
        onSuccess={() => {
          refetchProducts();
          invalidateQueries();
        }}
      />
    </div>
  );
};

export default ProductsManager;
