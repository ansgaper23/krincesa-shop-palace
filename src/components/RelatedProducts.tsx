
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';

interface RelatedProductsProps {
  currentProductId: string;
  categoryId?: string;
}

const RelatedProducts = ({ currentProductId, categoryId }: RelatedProductsProps) => {
  const { data: products } = useProducts();
  const { addToCart } = useCart();

  if (!products) return null;

  // Filtrar productos relacionados (misma categoría, excluyendo el actual)
  const relatedProducts = products
    .filter(product => 
      product.id !== currentProductId && 
      (categoryId ? product.category_id === categoryId : true)
    )
    .slice(0, 4); // Mostrar máximo 4 productos

  if (relatedProducts.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Productos Relacionados</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={`/product/${product.slug}`}>

              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            
            <div className="p-4">
              <Link to={`/product/${product.slug}`}>
                <h3 className="font-semibold text-gray-800 mb-1 hover:text-pink-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              
              {product.brand && (
                <Badge variant="secondary" className="mb-2 text-xs">
                  {product.brand}
                </Badge>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-pink-600">
                    S/ {product.price.toFixed(2)}
                  </span>
                  <p className="text-xs text-gray-500">
                    Por mayor: S/ {product.wholesale_price.toFixed(2)}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => addToCart(product, 1)}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
