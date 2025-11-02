
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useProductBySlug } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import RelatedProducts from '@/components/RelatedProducts';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug!);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Producto no encontrado</h2>
            <Link to="/" className="text-pink-500 hover:text-pink-600">
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isWholesale = quantity >= product.min_wholesale_quantity;
  const currentPrice = isWholesale ? product.wholesale_price : product.price;
  const totalPrice = currentPrice * quantity;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
  };

  const currentImageUrl = selectedImage || product.image_url || '/placeholder.svg';
  const additionalImages = product.additional_images || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-pink-500">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la tienda
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={currentImageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Imágenes adicionales */}
            {additionalImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                <div
                  className={`aspect-square bg-white rounded-lg shadow-md overflow-hidden cursor-pointer border-2 ${
                    !selectedImage ? 'border-pink-500' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImage('')}
                >
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:opacity-80"
                  />
                </div>
                {additionalImages.map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-square bg-white rounded-lg shadow-md overflow-hidden cursor-pointer border-2 ${
                      selectedImage === image ? 'border-pink-500' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover hover:opacity-80"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-product-title)' }}>{product.name}</h1>
              {product.brand && (
                <Badge variant="secondary" className="mb-4">
                  {product.brand}
                </Badge>
              )}
              {product.categories && (
                <Badge variant="outline" className="ml-2">
                  {product.categories.name}
                </Badge>
              )}
            </div>

            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--theme-product-title)' }}>Descripción</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Precios */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Precio por unidad:</span>
                  <span className="text-xl font-bold" style={{ color: 'var(--theme-product-price)' }}>S/ {product.price.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Precio por mayor ({product.min_wholesale_quantity}+ unidades):</span>
                  <span className="text-xl font-bold text-green-600">S/ {product.wholesale_price.toFixed(2)}</span>
                </div>

                {product.show_dozen_message && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-800 text-sm font-medium">
                      💬 Precio por docena: consultar al interno
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Selector de cantidad */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-product-title)' }}>Cantidad</h3>
              
              <div className="flex items-center space-x-4 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <span className="text-2xl font-bold text-gray-800 min-w-[3rem] text-center">
                  {quantity}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {isWholesale && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-800 text-sm font-medium">
                    🎉 ¡Precio por mayor aplicado!
                  </p>
                </div>
              )}

              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>Precio unitario:</span>
                  <span className="font-semibold">S/ {currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span style={{ color: 'var(--theme-product-price)' }}>S/ {totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full"
                style={{ 
                  backgroundColor: 'var(--theme-primary)',
                  color: 'var(--theme-button-text)'
                }}
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Añadir al carrito
              </Button>
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        <RelatedProducts 
          currentProductId={product.id} 
          categoryId={product.category_id} 
        />
      </div>
    </div>
  );
};

export default ProductDetail;
