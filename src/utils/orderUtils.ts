
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/database';

export interface OrderData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  province?: string;
  total_amount: number;
  notes?: string;
  items: CartItem[];
}

export const saveOrderToDatabase = async (orderData: OrderData) => {
  try {
    // First, save the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email || null,
        province: orderData.province || null,
        total_amount: orderData.total_amount,
        status: 'pendiente',
        notes: orderData.notes || null
      }])
      .select()
      .single();

    if (orderError) {
      console.error('Error saving order:', orderError);
      throw orderError;
    }

    // Then, save the order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      product_price: item.quantity >= item.product.min_wholesale_quantity 
        ? item.product.wholesale_price 
        : item.product.price,
      quantity: item.quantity,
      total_price: (item.quantity >= item.product.min_wholesale_quantity 
        ? item.product.wholesale_price 
        : item.product.price) * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error saving order items:', itemsError);
      throw itemsError;
    }

    console.log('Order and items saved successfully:', order);
    return order;
  } catch (error) {
    console.error('Failed to save order:', error);
    throw error;
  }
};

export const generateWhatsAppMessage = (orderData: OrderData, storeConfig: any): string => {
  let template = storeConfig?.whatsapp_message_template || 
    `NUEVO PEDIDO\n\nCliente: {{customer_name}}\nTelefono: {{customer_phone}}\nProvincia: {{province}}\n\nProductos:\n{{products_list}}\n\nTotal: S/ {{total_amount}}\n\nNotas: {{notes}}\n\nGracias por tu preferencia!`;
  
  // Build products list
  let productsList = '';
  orderData.items.forEach(item => {
    const price = item.quantity >= item.product.min_wholesale_quantity 
      ? item.product.wholesale_price 
      : item.product.price;
    productsList += `- ${item.product.name} - Cantidad: ${item.quantity} - S/ ${(price * item.quantity).toFixed(2)}\n`;
  });
  
  // Replace template variables
  let message = template
    .replace(/\{\{customer_name\}\}/g, orderData.customer_name)
    .replace(/\{\{customer_phone\}\}/g, orderData.customer_phone)
    .replace(/\{\{customer_email\}\}/g, orderData.customer_email || '')
    .replace(/\{\{province\}\}/g, orderData.province || '')
    .replace(/\{\{products_list\}\}/g, productsList.trim())
    .replace(/\{\{total_amount\}\}/g, orderData.total_amount.toFixed(2))
    .replace(/\{\{notes\}\}/g, orderData.notes || '');
  
  // If no notes, remove the notes line entirely
  if (!orderData.notes || orderData.notes.trim() === '') {
    message = message
      .replace(/\n*Notas:\s*\n*/gi, '\n')
      .replace(/\n{3,}/g, '\n\n'); // Clean up multiple newlines
  }
  
  return encodeURIComponent(message);
};

export const sendWhatsAppOrder = (message: string, whatsappNumber: string) => {
  // Remove any non-numeric characters except +
  const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
  const url = `https://wa.me/${cleanNumber}?text=${message}`;
  window.open(url, '_blank');
};
