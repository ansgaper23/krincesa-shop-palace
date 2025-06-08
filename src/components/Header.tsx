
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useStoreConfig } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const { getItemCount } = useCart();
  const { data: storeConfig } = useStoreConfig();
  const itemCount = getItemCount();

  return (
    <header className="bg-white shadow-sm border-b-2 border-pink-500 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo o nombre */}
          <Link to="/" className="flex items-center space-x-3">
            {storeConfig?.logo_url ? (
              <img
                src={storeConfig.logo_url}
                alt={storeConfig.store_name}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <h1 className="text-xl font-bold text-pink-600">
                {storeConfig?.store_name || 'Krincesa Distribuidora'}
              </h1>
            )}
          </Link>

          {/* Navegación */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-pink-500 font-medium">
              Inicio
            </Link>
          </nav>

          {/* Carrito */}
          <Link to="/cart">
            <Button variant="outline" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
