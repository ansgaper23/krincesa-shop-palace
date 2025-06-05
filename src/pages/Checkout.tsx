import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { useStoreConfig } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { saveOrderToDatabase, generateWhatsAppMessage, sendWhatsAppOrder } from "@/utils/orderUtils";
import Header from "@/components/Header";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getTotal, clearCart } = useCart();
  const { data: storeConfig } = useStoreConfig();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Tu carrito está vacío.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        customer_name: formData.name.trim(),
        customer_phone: formData.phone.trim(),
        customer_email: formData.email.trim() || undefined,
        total_amount: getTotal(),
        notes: formData.notes.trim() || undefined,
        items: items
      };

      // Save order to database
      const savedOrder = await saveOrderToDatabase(orderData);

      // Use the WhatsApp number from store config or fallback
      const whatsappNumber = storeConfig?.whatsapp_number || "+51999999999";
      console.log('Using WhatsApp number:', whatsappNumber);

      // Generate WhatsApp message
      const whatsappMessage = generateWhatsAppMessage(orderData, storeConfig);

      // Send WhatsApp message
      sendWhatsAppOrder(whatsappMessage, whatsappNumber);

      // Clear cart
      clearCart();
      
      toast({
        title: "¡Pedido enviado!",
        description: "Tu pedido ha sido guardado y enviado por WhatsApp.",
      });

      // Redirect to thank you page with order ID
      navigate(`/thank-you?order=${savedOrder.id}`);
      
    } catch (error: any) {
      console.error("Error processing order:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu pedido. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h1>
            <Button onClick={() => navigate("/")} className="bg-pink-500 hover:bg-pink-600">
              Continuar comprando
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Finalizar Pedido</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+51999999999"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Instrucciones especiales para tu pedido..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center py-2 border-b">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">S/ {(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-4 border-t-2 border-pink-200">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-lg font-bold text-pink-600">S/ {getTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 text-lg font-medium"
              >
                {isSubmitting ? "Procesando..." : "Enviar Pedido por WhatsApp"}
              </Button>
              
              <p className="text-sm text-gray-600 mt-4">
                Al enviar tu pedido, serás redirigido a WhatsApp para finalizar la compra con nuestro equipo.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
