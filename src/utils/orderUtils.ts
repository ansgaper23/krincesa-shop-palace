
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
    const { data, error } = await supabase
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

    if (error) {
      console.error('Error saving order:', error);
      throw error;
    }

    console.log('Order saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to save order:', error);
    throw error;
  }
};

export const generateWhatsAppMessage = (orderData: OrderData, storeConfig: any) => {
  const itemsList = orderData.items
    .map(item => `• ${item.product.name} - Cantidad: ${item.quantity} - S/ ${(item.product.price * item.quantity).toFixed(2)}`)
    .join('\n');

  const message = `🛍️ *NUEVO PEDIDO*

👤 *Cliente:* ${orderData.customer_name}
📱 *Teléfono:* ${orderData.customer_phone}
${orderData.customer_email ? `📧 *Email:* ${orderData.customer_email}` : ''}

📦 *Productos:*
${itemsList}

💰 *Total:* S/ ${orderData.total_amount.toFixed(2)}

${orderData.notes ? `📝 *Notas:* ${orderData.notes}` : ''}

¡Gracias por tu preferencia! 🌟`;

  return encodeURIComponent(message);
};

export const sendWhatsAppOrder = (message: string, whatsappNumber: string) => {
  // Remove any non-numeric characters except +
  const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
  const url = `https://wa.me/${cleanNumber}?text=${message}`;
  window.open(url, '_blank');
};
