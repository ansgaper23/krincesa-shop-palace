import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useStoreConfig } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
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
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastY = lastScrollYRef.current;
      const delta = currentScrollY - lastY;
      
      // Require a minimum scroll delta to prevent flicker from layout shifts
      if (Math.abs(delta) < 5) return;
      
      if (currentScrollY < 10) {
        setShowLogo(true);
      } else if (currentScrollY > 50) {
        setShowLogo(false);
      }
      
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const handleSearchChange = (term: string) => {
    // Comportamiento normal del buscador
    if (onSearchChange) {
      onSearchChange(term);
    }
  };
  return <header className="shadow-sm border-b-2 sticky top-0 z-50" style={{ backgroundColor: 'var(--theme-header-bg)', borderBottomColor: 'var(--theme-primary)' }}>
      <div className="container mx-auto px-4 py-4">
        {/* Logo centrado con efecto de desvanecimiento */}
        {!hideLogo && (
          <div 
            className="flex justify-center mb-4 overflow-hidden"
            style={{
              transition: 'opacity 0.8s ease-in-out, max-height 0.8s ease-in-out, margin-bottom 0.8s ease-in-out',
              opacity: showLogo ? 1 : 0,
              maxHeight: showLogo ? '5rem' : '0px',
              marginBottom: showLogo ? '1rem' : '0px',
            }}
          >
            <Link to="/" className="flex items-center space-x-3">
              {storeConfig?.logo_url ? <img src={storeConfig.logo_url} alt={storeConfig.store_name} className="h-12 w-auto object-contain" /> : <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--theme-header-text)' }}>
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