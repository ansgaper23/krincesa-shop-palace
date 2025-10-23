import { useState, useEffect } from 'react';
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

export const CartDrawer = () => {
  const { items, updateQuantity, removeFromCart, getTotal, getItemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const itemCount = getItemCount();

  // Auto-open when items are added
  useEffect(() => {
    if (itemCount > 0 && items.length > 0) {
      setIsOpen(true);
    }
  }, [itemCount]);

  const calculateItemPrice = (item: typeof items[0]) => {
    const isWholesale = item.quantity >= item.product.min_wholesale_quantity;
    const unitPrice = isWholesale ? item.product.wholesale_price : item.product.price;
    return unitPrice * item.quantity;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg w-14 h-14 p-0"
          size="lg"
          variant="default"
        >
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 rounded-full px-2 py-1 text-xs">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md flex flex-col" side="right">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Tu carrito está vacío</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => {
                  const isWholesale = item.quantity >= item.product.min_wholesale_quantity;
                  const unitPrice = isWholesale ? item.product.wholesale_price : item.product.price;
                  const itemTotal = calculateItemPrice(item);

                  return (
                    <div key={item.product.id} className="flex gap-3 border-b pb-4">
                      <img
                        src={item.product.image_url || '/placeholder.svg'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {item.product.name}
                        </h4>
                        
                        {isWholesale && (
                          <Badge variant="secondary" className="text-xs mb-1">
                            Precio por mayor
                          </Badge>
                        )}

                        <p className="text-xs text-muted-foreground mb-2">
                          S/ {unitPrice.toFixed(2)} c/u
                        </p>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center border rounded">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-sm">
                          S/ {itemTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-xl">S/ {getTotal().toFixed(2)}</span>
              </div>

              <Link to="/checkout" className="block">
                <Button className="w-full" size="lg">
                  Finalizar pedido
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
