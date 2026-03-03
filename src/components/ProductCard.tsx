import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { Product, Category } from '@/types/database';

interface ProductCardProps {
  product: Product & { categories: Category | null };
  onQuickView?: (product: Product & { categories: Category | null }) => void;
}

export const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const isWholesaleOnly = product.price === product.wholesale_price && product.min_wholesale_quantity === 1;

  return (
    <Link to={`/product/${product.slug}`} className="block group">
      <div className="bg-card rounded-xl shadow-sm overflow-hidden transition-all duration-300 ease-out h-full border border-border/50 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:border-primary/20">
        {/* Image container with overlay */}
        <div className="aspect-square bg-muted overflow-hidden relative">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          {/* Quick View button */}
          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 hover:bg-white shadow-md"
              aria-label="Vista rápida"
            >
              <Eye className="h-4 w-4 text-foreground" />
            </button>
          )}
        </div>
        
        <div className="p-3">
          <div className="mb-2">
            {product.categories && (
              <Badge variant="secondary" className="text-xs mb-1">
                {product.categories.name}
              </Badge>
            )}
            {product.brand && (
              <Badge variant="outline" className="text-xs ml-1">
                {product.brand}
              </Badge>
            )}
          </div>
          
          <h3 className="font-semibold mb-2 text-sm line-clamp-2 min-h-[2.5rem]" style={{ color: 'var(--theme-product-title)' }}>
            {product.name}
          </h3>
          
          <div className="space-y-1 mb-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Por unidad:</span>
              <span className="font-bold text-sm" style={{ color: 'var(--theme-product-price)' }}>S/ {product.price.toFixed(2)}</span>
            </div>
            {!isWholesaleOnly && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Por mayor ({product.min_wholesale_quantity}+):</span>
                <span className="font-bold text-green-600 text-sm">S/ {product.wholesale_price.toFixed(2)}</span>
              </div>
            )}
          </div>

          {product.show_dozen_message && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
              <p className="text-yellow-800 text-xs font-medium">
                💬 Precio por docena: consultar
              </p>
            </div>
          )}
          
          <Button
            onClick={handleAddToCart}
            className="w-full text-xs py-2 transition-all duration-300 group-hover:shadow-md"
            style={{ 
              backgroundColor: 'var(--theme-primary)',
              color: 'var(--theme-button-text)'
            }}
            size="sm"
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            Añadir
          </Button>
        </div>
      </div>
    </Link>
  );
};
