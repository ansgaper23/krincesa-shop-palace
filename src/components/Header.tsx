import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useStoreConfig } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
interface HeaderProps {
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  hideLogo?: boolean;
}
const Header = ({
  searchTerm = "",
  onSearchChange,
  hideLogo = false
}: HeaderProps) => {
  const {
    getItemCount
  } = useCart();
  const {
    data: storeConfig
  } = useStoreConfig();
  const navigate = useNavigate();
  const itemCount = getItemCount();
  const [showLogo, setShowLogo] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Si estamos arriba del todo (menos de 10px), mostrar logo
      if (currentScrollY < 10) {
        setShowLogo(true);
      } 
      // Si bajamos, ocultar logo
      else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowLogo(false);
      }
      // Si subimos, mostrar logo
      else if (currentScrollY < lastScrollY) {
        setShowLogo(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  const handleSearchChange = (term: string) => {
    // Detectar si se escribe "supersu" y redirigir al dashboard
    if (term.toLowerCase() === 'supersu') {
      navigate('/supersu');
      return;
    }

    // Comportamiento normal del buscador
    if (onSearchChange) {
      onSearchChange(term);
    }
  };
  return <header className="bg-white shadow-sm border-b-2 border-pink-500 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        {/* Logo centrado con efecto de desvanecimiento */}
        {!hideLogo && (
          <div 
            className={`flex justify-center mb-4 transition-all duration-500 ease-in-out overflow-hidden ${
              showLogo 
                ? 'opacity-100 max-h-20' 
                : 'opacity-0 max-h-0 mb-0'
            }`}
          >
            <Link to="/" className="flex items-center space-x-3">
              {storeConfig?.logo_url ? <img src={storeConfig.logo_url} alt={storeConfig.store_name} className="h-12 w-auto object-contain" /> : <h1 className="text-2xl font-bold text-pink-600 text-center">
                  {storeConfig?.store_name || 'Krincesa Distribuidora'}
                </h1>}
            </Link>
          </div>
        )}

        {/* Buscador y carrito */}
        <div className="flex items-center justify-between gap-4">
          {/* Buscador visible */}
          {onSearchChange && <div className="flex-1 max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input type="text" placeholder="Buscar productos..." value={searchTerm} onChange={e => handleSearchChange(e.target.value)} className="pl-10 w-full" />
              </div>
            </div>}

          {/* Carrito */}
          <Link to="/cart">
            
          </Link>
        </div>
      </div>
    </header>;
};
export default Header;