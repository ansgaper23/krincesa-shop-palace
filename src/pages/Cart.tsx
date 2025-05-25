import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, X, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useCoupon } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Coupon } from '@/types/database';

const Cart = () => {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    getSubtotal, 
    getTotal, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon 
  } = useCart();
  
  const [couponCode, setCouponCode] = useState('');
  const { toast } = useToast();

  const { data: couponData, refetch: refetchCoupon } = useCoupon(couponCode);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código de cupón",
        variant: "destructive",
      });
      return;
    }

    try {
      await refetchCoupon();
      if (couponData) {
        // Type assertion to ensure coupon data matches our type
        const validatedCoupon: Coupon = {
          ...couponData,
          discount_type: couponData.discount_type as 'percentage' | 'fixed'
        };
        
        const subtotal = getSubtotal();
        if (validatedCoupon.min_order_amount && subtotal < validatedCoupon.min_order_amount) {
          toast({
            title: "Cupón no válido",
            description: `Monto mínimo requerido: S/ ${validatedCoupon.min_order_amount}`,
            variant: "destructive",
          });
          return;
        }
        applyCoupon(validatedCoupon);
        setCouponCode('');
      } else {
        toast({
          title: "Cupón no válido",
          description: "El código ingresado no existe o ha expirado",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo verificar el cupón",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b-2 border-pink-500">
          <div className="container mx-auto px-4 py-4">
            <Link to="/" className="inline-flex items-center text-gray-700 hover:text-pink-500">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver a la tienda
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">¡Agrega algunos productos para comenzar!</p>
            <Link to="/">
              <Button className="bg-pink-500 hover:bg-pink-600">
                Ir a la tienda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b-2 border-pink-500">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center text-gray-700 hover:text-pink-500">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver a la tienda
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Carrito de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const isWholesale = item.quantity >= item.product.min_wholesale_quantity;
              const currentPrice = isWholesale ? item.product.wholesale_price : item.product.price;
              const itemTotal = currentPrice * item.quantity;

              return (
                <div key={item.product.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.image_url || '/placeholder.svg'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                      {item.product.brand && (
                        <p className="text-sm text-gray-600">{item.product.brand}</p>
                      )}
                      <div className="mt-2">
                        <span className="text-lg font-bold text-gray-800">
                          S/ {currentPrice.toFixed(2)}
                        </span>
                        {isWholesale && (
                          <span className="ml-2 text-sm text-green-600 font-medium">
                            (Precio por mayor)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="text-lg font-semibold min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">
                        S/ {itemTotal.toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700 mt-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Cupón de descuento</h3>
              
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-800">Cupón aplicado: {appliedCoupon.code}</p>
                      <p className="text-sm text-green-600">
                        Descuento: {appliedCoupon.discount_type === 'percentage' 
                          ? `${appliedCoupon.discount_value}%` 
                          : `S/ ${appliedCoupon.discount_value}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeCoupon}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Código de cupón"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Button onClick={handleApplyCoupon} variant="outline">
                    Aplicar
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Resumen del pedido</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>S/ {getSubtotal().toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento:</span>
                    <span>-S/ {(getSubtotal() - getTotal()).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-pink-600">S/ {getTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link to="/checkout" className="block w-full mt-6">
                <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white" size="lg">
                  Continuar con la compra
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
