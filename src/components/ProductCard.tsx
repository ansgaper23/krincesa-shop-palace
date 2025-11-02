
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { Product, Category } from '@/types/database';

interface ProductCardProps {
  product: Product & { categories: Category | null };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const isWholesaleOnly = product.price === product.wholesale_price && product.min_wholesale_quantity === 1;

  return (
    <Link to={`/product/${product.slug}`} className="block group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 group-hover:scale-105 h-full">
        <div className="aspect-square bg-gray-100 overflow-hidden">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
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
              <span className="text-xs text-gray-600">Por unidad:</span>
              <span className="font-bold text-sm" style={{ color: 'var(--theme-product-price)' }}>S/ {product.price.toFixed(2)}</span>
            </div>
            {!isWholesaleOnly && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Por mayor ({product.min_wholesale_quantity}+):</span>
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
            className="w-full text-xs py-2"
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
