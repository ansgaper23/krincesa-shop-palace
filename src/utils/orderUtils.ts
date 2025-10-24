
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/types/database';

export interface OrderData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
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

export const generateWhatsAppMessage = (orderData: OrderData, storeConfig: any) => {
  const itemsList = orderData.items
    .map(item => {
      const price = item.quantity >= item.product.min_wholesale_quantity 
        ? item.product.wholesale_price 
        : item.product.price;
      return `• ${item.product.name} - Cantidad: ${item.quantity} - S/ ${(price * item.quantity).toFixed(2)}`;
    })
    .join('\n');

  // Build message without emojis first for better encoding
  let message = `*NUEVO PEDIDO*\n\n`;
  message += `*Cliente:* ${orderData.customer_name}\n`;
  message += `*Telefono:* ${orderData.customer_phone}\n`;
  if (orderData.customer_email) {
    message += `*Email:* ${orderData.customer_email}\n`;
  }
  message += `\n*Productos:*\n${itemsList}\n\n`;
  message += `*Total:* S/ ${orderData.total_amount.toFixed(2)}\n`;
  if (orderData.notes) {
    message += `\n*Notas:* ${orderData.notes}\n`;
  }
  message += `\nGracias por tu preferencia!`;

  return encodeURIComponent(message);
};

export const sendWhatsAppOrder = (message: string, whatsappNumber: string) => {
  // Remove any non-numeric characters except +
  const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
  const url = `https://wa.me/${cleanNumber}?text=${message}`;
  window.open(url, '_blank');
};
