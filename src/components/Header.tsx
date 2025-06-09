
import { Link } from 'react-router-dom';
import { ShoppingCart, Search } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useStoreConfig } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

const Header = ({ searchTerm = "", onSearchChange }: HeaderProps) => {
  const { getItemCount } = useCart();
  const { data: storeConfig } = useStoreConfig();
  const itemCount = getItemCount();

  return (
    <header className="bg-white shadow-sm border-b-2 border-pink-500 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        {/* Logo centrado */}
        <div className="flex justify-center mb-4">
          <Link to="/" className="flex items-center space-x-3">
            {storeConfig?.logo_url ? (
              <img
                src={storeConfig.logo_url}
                alt={storeConfig.store_name}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <h1 className="text-2xl font-bold text-pink-600 text-center">
                {storeConfig?.store_name || 'Krincesa Distribuidora'}
              </h1>
            )}
          </Link>
        </div>

        {/* Buscador y carrito */}
        <div className="flex items-center justify-between gap-4">
          {/* Buscador visible */}
          {onSearchChange && (
            <div className="flex-1 max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
          )}

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
