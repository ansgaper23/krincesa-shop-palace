
import { useState } from 'react';
import { useAllProducts, useCategories } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQueryClient } from '@tanstack/react-query';
import { ImageUpload } from './ImageUpload';

const ProductsManager = () => {
  const { data: products, refetch: refetchProducts } = useAllProducts();
  const { data: categories } = useCategories();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    category_id: '',
    price: '',
    wholesale_price: '',
    min_wholesale_quantity: '3',
    image_url: '',
    show_dozen_message: false,
    is_active: true,
    wholesale_only: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      brand: '',
      category_id: '',
      price: '',
      wholesale_price: '',
      min_wholesale_quantity: '3',
      image_url: '',
      show_dozen_message: false,
      is_active: true,
      wholesale_only: false
    });
    setEditingProduct(null);
  };

  const invalidateQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['products'] });
    await queryClient.invalidateQueries({ queryKey: ['all-products'] });
    await queryClient.refetchQueries({ queryKey: ['products'] });
    await queryClient.refetchQueries({ queryKey: ['all-products'] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    
    if (!formData.name.trim() || !formData.price) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.wholesale_only && !formData.wholesale_price) {
      toast({
        title: "Error",
        description: "Si no es solo precio por unidad, debe tener precio por mayor.",
        variant: "destructive",
      });
      return;
    }
    
    const productData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      brand: formData.brand?.trim() || null,
      category_id: formData.category_id || null,
      price: parseFloat(formData.price),
      wholesale_price: formData.wholesale_only ? parseFloat(formData.price) : parseFloat(formData.wholesale_price || formData.price),
      min_wholesale_quantity: formData.wholesale_only ? 1 : parseInt(formData.min_wholesale_quantity) || 3,
      image_url: formData.image_url || null,
      show_dozen_message: formData.show_dozen_message,
      is_active: formData.is_active,
      updated_at: new Date().toISOString()
    };

    console.log('Product data to save:', productData);

    try {
      let result;
      if (editingProduct) {
        console.log('Updating product with ID:', editingProduct.id);
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select();
        
        console.log('Update result:', result);
        
        if (result.error) throw result.error;
        
        toast({
          title: "Producto actualizado",
          description: "El producto se ha actualizado correctamente.",
        });
      } else {
        console.log('Creating new product');
        result = await supabase
          .from('products')
          .insert([productData])
          .select();
        
        console.log('Insert result:', result);
        
        if (result.error) throw result.error;
        
        toast({
          title: "Producto creado",
          description: "El producto se ha creado correctamente.",
        });
      }
      
      await invalidateQueries();
      await refetchProducts();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un error al guardar el producto.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: any) => {
    console.log('Editing product:', product);
    setEditingProduct(product);
    
    const isWholesaleOnly = product.price === product.wholesale_price && product.min_wholesale_quantity === 1;
    
    setFormData({
      name: product.name || '',
      description: product.description || '',
      brand: product.brand || '',
      category_id: product.category_id || '',
      price: product.price?.toString() || '',
      wholesale_price: product.wholesale_price?.toString() || '',
      min_wholesale_quantity: product.min_wholesale_quantity?.toString() || '3',
      image_url: product.image_url || '',
      show_dozen_message: product.show_dozen_message || false,
      is_active: product.is_active ?? true,
      wholesale_only: isWholesaleOnly
    });
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lista de Productos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-pink-500 hover:bg-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="wholesale_only"
                  checked={formData.wholesale_only}
                  onCheckedChange={(checked) => {
                    setFormData({ 
                      ...formData, 
                      wholesale_only: checked,
                      wholesale_price: checked ? formData.price : formData.wholesale_price,
                      min_wholesale_quantity: checked ? '1' : '3'
                    });
                  }}
                />
                <Label htmlFor="wholesale_only">Solo precio por unidad (sin precio por mayor)</Label>
              </div>

              {formData.wholesale_only ? (
                <div>
                  <Label htmlFor="price">Precio por Unidad *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Precio por Unidad *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="wholesale_price">Precio por Mayor *</Label>
                    <Input
                      id="wholesale_price"
                      type="number"
                      step="0.01"
                      value={formData.wholesale_price}
                      onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="min_wholesale_quantity">Cantidad Mínima Mayor *</Label>
                    <Input
                      id="min_wholesale_quantity"
                      type="number"
                      value={formData.min_wholesale_quantity}
                      onChange={(e) => setFormData({ ...formData, min_wholesale_quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                label="Imagen del Producto"
              />

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show_dozen_message"
                    checked={formData.show_dozen_message}
                    onCheckedChange={(checked) => setFormData({ ...formData, show_dozen_message: checked })}
                  />
                  <Label htmlFor="show_dozen_message">Mostrar mensaje "precio por docena"</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Producto activo</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
                  {editingProduct ? 'Actualizar' : 'Crear'} Producto
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-x-auto">
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
    </div>
  );
};

export default ProductsManager;
