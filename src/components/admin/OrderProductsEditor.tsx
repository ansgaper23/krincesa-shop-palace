
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2 } from 'lucide-react';
import { Product, OrderItem } from '@/types/database';

interface OrderProductsEditorProps {
  orderId: string;
  orderItems: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
  onTotalChange: (total: number) => void;
}

const OrderProductsEditor = ({ orderId, orderItems, onItemsChange, onTotalChange }: OrderProductsEditorProps) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<OrderItem[]>(orderItems);
  const [newItem, setNewItem] = useState({
    product_id: '',
    quantity: 1
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setItems(orderItems);
  }, [orderItems]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Error al cargar los productos.",
        variant: "destructive",
      });
    }
  };

  const calculatePrice = (product: Product, quantity: number) => {
    return quantity >= product.min_wholesale_quantity 
      ? product.wholesale_price 
      : product.price;
  };

  const addProduct = async () => {
    if (!newItem.product_id) {
      toast({
        title: "Error",
        description: "Selecciona un producto.",
        variant: "destructive",
      });
      return;
    }

    const product = products.find(p => p.id === newItem.product_id);
    if (!product) return;

    const price = calculatePrice(product, newItem.quantity);
    const totalPrice = price * newItem.quantity;

    const orderItemData = {
      order_id: orderId,
      product_id: product.id,
      product_name: product.name,
      product_price: price,
      quantity: newItem.quantity,
      total_price: totalPrice
    };

    try {
      const { data, error } = await supabase
        .from('order_items')
        .insert([orderItemData])
        .select()
        .single();

      if (error) throw error;

      const updatedItems = [...items, data];
      setItems(updatedItems);
      onItemsChange(updatedItems);
      updateOrderTotal(updatedItems);

      setNewItem({ product_id: '', quantity: 1 });

      toast({
        title: "Producto agregado",
        description: "El producto se ha agregado al pedido.",
      });
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Error al agregar el producto.",
        variant: "destructive",
      });
    }
  };

  const removeProduct = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      const updatedItems = items.filter(item => item.id !== itemId);
      setItems(updatedItems);
      onItemsChange(updatedItems);
      updateOrderTotal(updatedItems);

      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado del pedido.",
      });
    } catch (error: any) {
      console.error('Error removing product:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el producto.",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const product = products.find(p => p.id === item.product_id);
    if (!product) return;

    const price = calculatePrice(product, newQuantity);
    const totalPrice = price * newQuantity;

    try {
      const { error } = await supabase
        .from('order_items')
        .update({
          quantity: newQuantity,
          product_price: price,
          total_price: totalPrice
        })
        .eq('id', itemId);

      if (error) throw error;

      const updatedItems = items.map(i => 
        i.id === itemId 
          ? { ...i, quantity: newQuantity, product_price: price, total_price: totalPrice }
          : i
      );
      setItems(updatedItems);
      onItemsChange(updatedItems);
      updateOrderTotal(updatedItems);

      toast({
        title: "Cantidad actualizada",
        description: "La cantidad del producto se ha actualizado.",
      });
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Error al actualizar la cantidad.",
        variant: "destructive",
      });
    }
  };

  const updateOrderTotal = async (updatedItems: OrderItem[]) => {
    const total = updatedItems.reduce((sum, item) => sum + item.total_price, 0);
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ total_amount: total })
        .eq('id', orderId);

      if (error) throw error;
      onTotalChange(total);
    } catch (error: any) {
      console.error('Error updating order total:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <h4 className="font-semibold mb-3">Agregar Producto</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Producto</Label>
            <Select
              value={newItem.product_id}
              onValueChange={(value) => setNewItem({ ...newItem, product_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - S/ {product.price.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cantidad</Label>
            <Input
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={addProduct} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Precio Unit.</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.product_name}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>S/ {item.product_price.toFixed(2)}</TableCell>
                <TableCell>S/ {item.total_price.toFixed(2)}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeProduct(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay productos en este pedido
        </div>
      )}
    </div>
  );
};

export default OrderProductsEditor;
