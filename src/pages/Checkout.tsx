
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useStoreConfig } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const Checkout = () => {
  const { items, getTotal, appliedCoupon } = useCart();
  const { data: storeConfig } = useStoreConfig();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    notes: '',
    acceptTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateWhatsAppMessage = () => {
    const orderDetails = items.map(item => {
      const isWholesale = item.quantity >= item.product.min_wholesale_quantity;
      const currentPrice = isWholesale ? item.product.wholesale_price : item.product.price;
      const itemTotal = currentPrice * item.quantity;
      
      return `• ${item.product.name} - Cantidad: ${item.quantity} - Precio: S/ ${currentPrice.toFixed(2)} c/u - Subtotal: S/ ${itemTotal.toFixed(2)}`;
    }).join('\n');

    const subtotal = items.reduce((total, item) => {
      const price = item.quantity >= item.product.min_wholesale_quantity 
        ? item.product.wholesale_price 
        : item.product.price;
      return total + (price * item.quantity);
    }, 0);

    let message = `🛍️ *NUEVO PEDIDO - KRINCESA DISTRIBUIDORA*\n\n`;
    message += `👤 *DATOS DEL CLIENTE:*\n`;
    message += `Nombre: ${formData.firstName} ${formData.lastName}\n`;
    message += `Teléfono: ${formData.phone}\n`;
    if (formData.notes) {
      message += `Notas: ${formData.notes}\n`;
    }
    message += `\n📦 *PRODUCTOS:*\n${orderDetails}\n\n`;
    message += `💰 *RESUMEN:*\n`;
    message += `Subtotal: S/ ${subtotal.toFixed(2)}\n`;
    
    if (appliedCoupon) {
      const discount = subtotal - getTotal();
      message += `Descuento (${appliedCoupon.code}): -S/ ${discount.toFixed(2)}\n`;
    }
    
    message += `*TOTAL: S/ ${getTotal().toFixed(2)}*\n\n`;
    message += `¡Gracias por tu preferencia! 💕`;

    return encodeURIComponent(message);
  };

  const handleSubmitOrder = () => {
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Error",
        description: "Debes aceptar los términos y condiciones",
        variant: "destructive",
      });
      return;
    }

    const whatsappNumber = storeConfig?.whatsapp_number || '+51999999999';
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No hay productos en el carrito</h2>
          <Link to="/" className="text-pink-500 hover:text-pink-600">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b-2 border-pink-500">
        <div className="container mx-auto px-4 py-4">
          <Link to="/cart" className="inline-flex items-center text-gray-700 hover:text-pink-500">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver al carrito
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Detalles de Facturación</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Información del cliente</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellidos *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Tus apellidos"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+51 999 999 999"
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Notas del pedido (opcional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Información adicional sobre tu pedido..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2 mt-6">
                <Checkbox 
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))
                  }
                />
                <Label htmlFor="acceptTerms" className="text-sm">
                  He leído y estoy de acuerdo con los términos y condiciones de la web *
                </Label>
              </div>
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Tu pedido</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => {
                const isWholesale = item.quantity >= item.product.min_wholesale_quantity;
                const currentPrice = isWholesale ? item.product.wholesale_price : item.product.price;
                const itemTotal = currentPrice * item.quantity;

                return (
                  <div key={item.product.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x S/ {currentPrice.toFixed(2)}
                        {isWholesale && <span className="text-green-600 ml-1">(Mayor)</span>}
                      </p>
                    </div>
                    <span className="font-medium">S/ {itemTotal.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>S/ {items.reduce((total, item) => {
                  const price = item.quantity >= item.product.min_wholesale_quantity 
                    ? item.product.wholesale_price 
                    : item.product.price;
                  return total + (price * item.quantity);
                }, 0).toFixed(2)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento ({appliedCoupon.code}):</span>
                  <span>-S/ {(items.reduce((total, item) => {
                    const price = item.quantity >= item.product.min_wholesale_quantity 
                      ? item.product.wholesale_price 
                      : item.product.price;
                    return total + (price * item.quantity);
                  }, 0) - getTotal()).toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-pink-600">S/ {getTotal().toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleSubmitOrder}
              className="w-full bg-green-500 hover:bg-green-600 text-white mt-6"
              size="lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Realizar Pedido por WhatsApp
            </Button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Al hacer clic, serás redirigido a WhatsApp con los detalles de tu pedido
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
