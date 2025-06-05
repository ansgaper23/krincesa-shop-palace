import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Order, OrderItem } from '@/types/database';
import OrderProductsEditor from './OrderProductsEditor';
import jsPDF from 'jspdf';

const OrdersManager = () => {
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<{ [orderId: string]: OrderItem[] }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    total_amount: '',
    status: 'pendiente',
    notes: ''
  });

  const statusOptions = [
    { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmado', label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
    { value: 'enviado', label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
    { value: 'entregado', label: 'Entregado', color: 'bg-green-100 text-green-800' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
  ];

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);

      // Fetch order items for all orders
      if (data && data.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', data.map(order => order.id));

        if (itemsError) throw itemsError;

        // Group items by order_id
        const itemsByOrder: { [orderId: string]: OrderItem[] } = {};
        items?.forEach(item => {
          if (!itemsByOrder[item.order_id]) {
            itemsByOrder[item.order_id] = [];
          }
          itemsByOrder[item.order_id].push(item);
        });
        
        setOrderItems(itemsByOrder);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Error al cargar los pedidos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      total_amount: '',
      status: 'pendiente',
      notes: ''
    });
    setEditingOrder(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name.trim() || !formData.customer_phone.trim()) {
      toast({
        title: "Error",
        description: "Nombre del cliente y teléfono son obligatorios.",
        variant: "destructive",
      });
      return;
    }
    
    const orderData = {
      customer_name: formData.customer_name.trim(),
      customer_phone: formData.customer_phone.trim(),
      customer_email: formData.customer_email?.trim() || null,
      total_amount: parseFloat(formData.total_amount) || 0,
      status: formData.status,
      notes: formData.notes?.trim() || null,
      updated_at: new Date().toISOString()
    };

    try {
      let result;
      if (editingOrder) {
        result = await supabase
          .from('orders')
          .update(orderData)
          .eq('id', editingOrder.id)
          .select();
        
        toast({
          title: "Pedido actualizado",
          description: "El pedido se ha actualizado correctamente.",
        });
      } else {
        result = await supabase
          .from('orders')
          .insert([{ ...orderData, created_at: new Date().toISOString() }])
          .select();
        
        toast({
          title: "Pedido creado",
          description: "El pedido se ha creado correctamente.",
        });
      }
      
      if (result.error) throw result.error;
      
      await fetchOrders();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving order:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un error al guardar el pedido.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      customer_name: order.customer_name || '',
      customer_phone: order.customer_phone || '',
      customer_email: order.customer_email || '',
      total_amount: order.total_amount?.toString() || '',
      status: order.status || 'pendiente',
      notes: order.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleView = (order: Order) => {
    setViewingOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este pedido?')) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast({
        title: "Pedido eliminado",
        description: "El pedido se ha eliminado correctamente.",
      });
      
      await fetchOrders();
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un error al eliminar el pedido.",
        variant: "destructive",
      });
    }
  };

  const generatePDF = (order: Order) => {
    const items = orderItems[order.id] || [];
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('GUÍA DE VENTA', 105, 30, { align: 'center' });
    
    // Order info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Código: #${order.id.slice(0, 8).toUpperCase()}`, 20, 50);
    doc.text(`Fecha: ${new Date(order.created_at).toLocaleDateString()}`, 20, 60);
    
    // Customer info
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL CLIENTE:', 20, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${order.customer_name}`, 20, 90);
    doc.text(`Teléfono: ${order.customer_phone}`, 20, 100);
    if (order.customer_email) {
      doc.text(`Email: ${order.customer_email}`, 20, 110);
    }
    
    // Products table header
    const startY = order.customer_email ? 130 : 120;
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUCTOS:', 20, startY);
    
    // Table headers
    const tableStartY = startY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Producto', 20, tableStartY);
    doc.text('Cant.', 110, tableStartY);
    doc.text('Precio', 140, tableStartY);
    doc.text('Total', 170, tableStartY);
    
    // Draw line under headers
    doc.line(20, tableStartY + 2, 190, tableStartY + 2);
    
    // Table content
    doc.setFont('helvetica', 'normal');
    let currentY = tableStartY + 10;
    
    items.forEach((item, index) => {
      if (currentY > 270) { // New page if needed
        doc.addPage();
        currentY = 30;
      }
      
      const productName = item.product_name.length > 25 
        ? item.product_name.substring(0, 25) + '...'
        : item.product_name;
      
      doc.text(productName, 20, currentY);
      doc.text(item.quantity.toString(), 110, currentY);
      doc.text(`S/ ${item.product_price.toFixed(2)}`, 140, currentY);
      doc.text(`S/ ${item.total_price.toFixed(2)}`, 170, currentY);
      
      currentY += 10;
    });
    
    // Total
    currentY += 10;
    doc.line(20, currentY, 190, currentY);
    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`TOTAL: S/ ${order.total_amount.toFixed(2)}`, 170, currentY, { align: 'right' });
    
    // Status and notes
    currentY += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const statusLabel = statusOptions.find(s => s.value === order.status)?.label || order.status;
    doc.text(`Estado: ${statusLabel}`, 20, currentY);
    
    if (order.notes) {
      currentY += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('Notas:', 20, currentY);
      currentY += 10;
      doc.setFont('helvetica', 'normal');
      const notes = doc.splitTextToSize(order.notes, 170);
      doc.text(notes, 20, currentY);
    }
    
    // Download
    doc.save(`guia-venta-${order.id.slice(0, 8)}.pdf`);
  };

  const handleOrderItemsChange = (orderId: string, items: OrderItem[]) => {
    setOrderItems(prev => ({
      ...prev,
      [orderId]: items
    }));
  };

  const handleOrderTotalChange = (orderId: string, total: number) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, total_amount: total }
        : order
    ));
    
    if (editingOrder && editingOrder.id === orderId) {
      setEditingOrder(prev => prev ? { ...prev, total_amount: total } : null);
      setFormData(prev => ({ ...prev, total_amount: total.toString() }));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(opt => opt.value === status);
    return (
      <Badge className={statusConfig?.color || 'bg-gray-100 text-gray-800'}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center py-8">Cargando pedidos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Historial de Pedidos ({orders.length})</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-pink-500 hover:bg-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrder ? 'Editar Pedido' : 'Nuevo Pedido'}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList>
                <TabsTrigger value="details">Detalles del Pedido</TabsTrigger>
                {editingOrder && (
                  <TabsTrigger value="products">Productos</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="details">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="customer_name">Nombre del Cliente *</Label>
                    <Input
                      id="customer_name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="customer_phone">Teléfono *</Label>
                    <Input
                      id="customer_phone"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="customer_email">Email</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="total_amount">Monto Total</Label>
                    <Input
                      id="total_amount"
                      type="number"
                      step="0.01"
                      value={formData.total_amount}
                      onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notas</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      placeholder="Notas adicionales sobre el pedido..."
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-pink-500 hover:bg-pink-600">
                      {editingOrder ? 'Actualizar' : 'Crear'} Pedido
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {editingOrder && (
                <TabsContent value="products">
                  <OrderProductsEditor
                    orderId={editingOrder.id}
                    orderItems={orderItems[editingOrder.id] || []}
                    onItemsChange={(items) => handleOrderItemsChange(editingOrder.id, items)}
                    onTotalChange={(total) => handleOrderTotalChange(editingOrder.id, total)}
                  />
                </TabsContent>
              )}
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const items = orderItems[order.id] || [];
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="font-medium">{order.customer_name}</TableCell>
                  <TableCell>{order.customer_phone}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {items.length > 0 ? (
                        <span>{items.length} producto{items.length !== 1 ? 's' : ''}</span>
                      ) : (
                        <span className="text-gray-400">Sin productos</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>S/ {order.total_amount?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generatePDF(order)}
                        title="Generar guía de venta PDF"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(order)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(order)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(order.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay pedidos registrados</p>
          <p className="text-gray-400 text-sm mt-2">Los pedidos aparecerán aquí cuando los clientes realicen compras</p>
        </div>
      )}

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido #{viewingOrder?.id.slice(0, 8).toUpperCase()}</DialogTitle>
          </DialogHeader>
          
          {viewingOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Cliente:</strong> {viewingOrder.customer_name}
                </div>
                <div>
                  <strong>Teléfono:</strong> {viewingOrder.customer_phone}
                </div>
                {viewingOrder.customer_email && (
                  <div className="col-span-2">
                    <strong>Email:</strong> {viewingOrder.customer_email}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Estado:</strong> {getStatusBadge(viewingOrder.status)}
                </div>
                <div>
                  <strong>Fecha:</strong> {new Date(viewingOrder.created_at).toLocaleString()}
                </div>
              </div>

              {orderItems[viewingOrder.id] && orderItems[viewingOrder.id].length > 0 && (
                <div>
                  <strong>Productos:</strong>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Cantidad</TableHead>
                          <TableHead>Precio Unit.</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems[viewingOrder.id].map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>S/ {item.product_price.toFixed(2)}</TableCell>
                            <TableCell>S/ {item.total_price.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total del Pedido:</span>
                  <span>S/ {viewingOrder.total_amount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              {viewingOrder.notes && (
                <div>
                  <strong>Notas:</strong>
                  <p className="mt-1 text-gray-600 bg-gray-50 p-3 rounded">{viewingOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManager;
