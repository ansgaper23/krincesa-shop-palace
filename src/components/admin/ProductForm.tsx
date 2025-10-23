
import { useState, useEffect } from 'react';
import { useCategories } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { ImageUpload } from './ImageUpload';
import { Plus } from 'lucide-react';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct?: any;
  onSuccess: () => void;
}

const ProductForm = ({ isOpen, onClose, editingProduct, onSuccess }: ProductFormProps) => {
  const { data: categories, refetch: refetchCategories } = useCategories();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: editingProduct?.name || '',
    description: editingProduct?.description || '',
    brand: editingProduct?.brand || '',
    category_id: editingProduct?.category_id || '',
    price: editingProduct?.price?.toString() || '',
    wholesale_price: editingProduct?.wholesale_price?.toString() || '',
    min_wholesale_quantity: editingProduct?.min_wholesale_quantity?.toString() || '3',
    image_url: editingProduct?.image_url || '',
    show_dozen_message: editingProduct?.show_dozen_message || false,
    is_active: editingProduct?.is_active ?? true,
    has_wholesale: editingProduct ? editingProduct.wholesale_price !== editingProduct.price : false,
    stock: editingProduct?.stock?.toString() || '0'
  });

  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [showStockField, setShowStockField] = useState(!!editingProduct?.stock);

  useEffect(() => {
    if (editingProduct && isOpen) {
      setFormData({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        brand: editingProduct.brand || '',
        category_id: editingProduct.category_id || '',
        price: editingProduct.price?.toString() || '',
        wholesale_price: editingProduct.wholesale_price?.toString() || '',
        min_wholesale_quantity: editingProduct.min_wholesale_quantity?.toString() || '3',
        image_url: editingProduct.image_url || '',
        show_dozen_message: editingProduct.show_dozen_message || false,
        is_active: editingProduct.is_active ?? true,
        has_wholesale: editingProduct.wholesale_price !== editingProduct.price,
        stock: editingProduct.stock?.toString() || '0'
      });
      setShowStockField(!!editingProduct.stock);
    } else if (!editingProduct && isOpen) {
      resetForm();
      setShowStockField(false);
    }
  }, [editingProduct, isOpen]);

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
      has_wholesale: false,
      stock: '0'
    });
    setNewCategoryName('');
    setShowNewCategoryForm(false);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para la categoría.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCategoryName.trim() }])
        .select()
        .single();

      if (error) throw error;

      await refetchCategories();
      setFormData({ ...formData, category_id: data.id });
      setNewCategoryName('');
      setShowNewCategoryForm(false);
      
      toast({
        title: "Categoría creada",
        description: "La nueva categoría se ha creado correctamente.",
      });
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un error al crear la categoría.",
        variant: "destructive",
      });
    }
  };

  const invalidateQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['products'] });
    await queryClient.invalidateQueries({ queryKey: ['all-products'] });
    await queryClient.refetchQueries({ queryKey: ['products'] });
    await queryClient.refetchQueries({ queryKey: ['all-products'] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price) {
      toast({
        title: "Error",
        description: "Por favor completa el nombre y precio del producto.",
        variant: "destructive",
      });
      return;
    }

    if (formData.has_wholesale && !formData.wholesale_price) {
      toast({
        title: "Error",
        description: "Si tiene precio por mayor, debe especificar el precio por mayor.",
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
      wholesale_price: formData.has_wholesale ? parseFloat(formData.wholesale_price || formData.price) : parseFloat(formData.price),
      min_wholesale_quantity: formData.has_wholesale ? parseInt(formData.min_wholesale_quantity) || 3 : 1,
      image_url: formData.image_url || null,
      show_dozen_message: formData.show_dozen_message,
      is_active: formData.is_active,
      stock: parseInt(formData.stock) || 0,
      slug: '',
      updated_at: new Date().toISOString()
    };

    try {
      let result;
      if (editingProduct) {
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select();
        
        if (result.error) throw result.error;
        
        toast({
          title: "Producto actualizado",
          description: "El producto se ha actualizado correctamente.",
        });
      } else {
        result = await supabase
          .from('products')
          .insert([productData])
          .select();
        
        if (result.error) throw result.error;
        
        toast({
          title: "Producto creado",
          description: "El producto se ha creado correctamente.",
        });
      }
      
      await invalidateQueries();
      onSuccess();
      onClose();
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

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
              <Label htmlFor="brand">Marca (opcional)</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Ingresa la marca si aplica"
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
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="category">Categoría</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Nueva
              </Button>
            </div>
            
            {showNewCategoryForm && (
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Nombre de la nueva categoría"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button type="button" onClick={handleCreateCategory} size="sm">
                  Crear
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNewCategoryForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            )}
            
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

          <div>
            <Label htmlFor="price">Precio *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <Switch
              id="track_stock"
              checked={showStockField}
              onCheckedChange={setShowStockField}
            />
            <Label htmlFor="track_stock">Controlar inventario</Label>
          </div>

          {showStockField && (
            <div>
              <Label htmlFor="stock">Stock/Inventario</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
          )}

          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="has_wholesale"
              checked={formData.has_wholesale}
              onCheckedChange={(checked) => {
                setFormData({ 
                  ...formData, 
                  has_wholesale: checked,
                  wholesale_price: checked ? formData.wholesale_price : '',
                  min_wholesale_quantity: checked ? formData.min_wholesale_quantity : '1'
                });
              }}
            />
            <Label htmlFor="has_wholesale">¿Tiene precio por mayor?</Label>
          </div>

          {formData.has_wholesale && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
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

          <div className="flex flex-col-reverse sm:flex-row justify-end space-y-reverse space-y-2 sm:space-y-0 sm:space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
              {editingProduct ? 'Actualizar' : 'Crear'} Producto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
