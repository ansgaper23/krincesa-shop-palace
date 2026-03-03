import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { Product, Category } from '@/types/database';

interface ProductQuickViewProps {
  product: (Product & { categories: Category | null }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductQuickView = ({ product, open, onOpenChange }: ProductQuickViewProps) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) return null;

  const isWholesaleOnly = product.price === product.wholesale_price && product.min_wholesale_quantity === 1;
  const isWholesale = quantity >= product.min_wholesale_quantity;
  const unitPrice = isWholesale ? product.wholesale_price : product.price;
  const totalPrice = unitPrice * quantity;

  const allImages = [
    product.image_url,
    ...(product.additional_images || []),
  ].filter(Boolean) as string[];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onOpenChange(false);
    setQuantity(1);
    setSelectedImage(0);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setQuantity(1);
      setSelectedImage(0);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="bg-muted/30 p-4">
            <div className="aspect-square rounded-lg overflow-hidden mb-3">
              <img
                src={allImages[selectedImage] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-14 h-14 rounded-md overflow-hidden border-2 shrink-0 transition-colors ${
                      selectedImage === i ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-5 flex flex-col">
            <DialogHeader className="mb-3">
              <div className="flex gap-2 mb-2">
                {product.categories && (
                  <Badge variant="secondary" className="text-xs">{product.categories.name}</Badge>
                )}
                {product.brand && (
                  <Badge variant="outline" className="text-xs">{product.brand}</Badge>
                )}
              </div>
              <DialogTitle className="text-lg leading-tight">{product.name}</DialogTitle>
            </DialogHeader>

            {product.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{product.description}</p>
            )}

            {/* Prices */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Por unidad:</span>
                <span className="font-bold text-lg" style={{ color: 'var(--theme-product-price)' }}>
                  S/ {product.price.toFixed(2)}
                </span>
              </div>
              {!isWholesaleOnly && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Por mayor ({product.min_wholesale_quantity}+):</span>
                  <span className="font-bold text-green-600">S/ {product.wholesale_price.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium">Cantidad:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Wholesale indicator */}
            {!isWholesaleOnly && isWholesale && (
              <div className="bg-green-50 border border-green-200 rounded-md p-2 mb-4">
                <p className="text-green-700 text-xs font-medium">✅ Precio por mayor aplicado</p>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center mb-4 p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-xl" style={{ color: 'var(--theme-product-price)' }}>
                S/ {totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-2">
              <Button
                onClick={handleAddToCart}
                className="w-full"
                style={{
                  backgroundColor: 'var(--theme-primary)',
                  color: 'var(--theme-button-text)',
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Agregar al carrito
              </Button>
              <Link to={`/product/${product.slug}`} className="block">
                <Button variant="outline" className="w-full text-sm">
                  Ver detalles completos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
