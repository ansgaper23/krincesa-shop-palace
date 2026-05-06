import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { CartIcon } from '@/components/CartIcon';
import { useCart } from '@/hooks/useCart';
import { useStoreConfig, useCategories } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

interface HeaderProps {
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onSelectCategory?: (id: string | null) => void;
}

const Header = ({ searchTerm = '', onSearchChange, onSelectCategory }: HeaderProps) => {
  const { getItemCount } = useCart();
  const { data: storeConfig } = useStoreConfig();
  const { data: categories } = useCategories();
  const navigate = useNavigate();
  const itemCount = getItemCount();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);

  // Hot keyword for admin access
  useEffect(() => {
    if (searchTerm.toLowerCase().trim() === 'supersu') {
      onSearchChange?.('');
      navigate('/admin/login');
    }
  }, [searchTerm, navigate, onSearchChange]);

  const goToCategory = (id: string | null) => {
    onSelectCategory?.(id);
    setMobileOpen(false);
    setCatsOpen(false);
    setTimeout(() => {
      const el = document.getElementById('products-grid');
      if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }, 50);
  };

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md bg-white/95"
      style={{ borderBottomColor: 'hsl(var(--border))' }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {storeConfig?.logo_url ? (
              <img src={storeConfig.logo_url} alt={storeConfig.store_name} className="h-12 w-12 sm:h-14 sm:w-14 object-cover rounded-full" />
            ) : (
              <div className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: 'var(--theme-primary)' }}>
                {storeConfig?.store_name?.charAt(0) || 'K'}
              </div>
            )}
            <span className="hidden sm:inline font-bold text-lg" style={{ color: 'var(--theme-primary)' }}>
              {storeConfig?.store_name}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <div className="relative">
              <button
                onClick={() => setCatsOpen(!catsOpen)}
                onBlur={() => setTimeout(() => setCatsOpen(false), 150)}
                className="flex items-center gap-1 font-medium hover:text-primary transition-colors"
              >
                Categorías <ChevronDown className="h-4 w-4" />
              </button>
              {catsOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border py-2 min-w-[200px] z-50">
                  {categories?.map((c) => (
                    <button
                      key={c.id}
                      onMouseDown={() => goToCategory(c.id)}
                      className="block w-full text-left px-4 py-2 hover:bg-muted text-sm"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => goToCategory(null)} className="font-medium hover:text-primary transition-colors">
              Todos los productos
            </button>
            <Link to="/" className="font-medium hover:text-primary transition-colors">Tienda</Link>
            <a
              href={storeConfig?.whatsapp_number ? `https://wa.me/${storeConfig.whatsapp_number.replace(/[^\d+]/g, '')}` : '#'}
              target="_blank"
              rel="noreferrer"
              className="font-medium hover:text-primary transition-colors"
            >
              Contáctanos
            </a>
          </nav>

          {/* Search desktop */}
          {onSearchChange && (
            <div className="hidden md:block relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="¿Qué estás buscando?"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 rounded-full bg-muted/50 border-none"
              />
            </div>
          )}

          {/* Cart */}
          <Link to="/cart" className="relative p-2 rounded-lg hover:bg-muted">
            <CartIcon className="h-6 w-6" />
            {itemCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full text-xs"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                {itemCount}
              </Badge>
            )}
          </Link>
        </div>

        {/* Search mobile */}
        {onSearchChange && (
          <div className="md:hidden mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="¿Qué estás buscando?"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 rounded-full bg-muted/50 border-none"
            />
          </div>
        )}

        {/* Mobile menu drawer */}
        {mobileOpen && (
          <div className="md:hidden mt-3 border-t pt-3 space-y-2">
            <button onClick={() => goToCategory(null)} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-muted font-medium">
              Todos los productos
            </button>
            <div>
              <p className="px-3 py-2 text-xs uppercase text-muted-foreground font-semibold">Categorías</p>
              {categories?.map((c) => (
                <button
                  key={c.id}
                  onClick={() => goToCategory(c.id)}
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm"
                >
                  {c.name}
                </button>
              ))}
            </div>
            {storeConfig?.whatsapp_number && (
              <a
                href={`https://wa.me/${storeConfig.whatsapp_number.replace(/[^\d+]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="block px-3 py-2 rounded-lg hover:bg-muted font-medium"
              >
                Contáctanos
              </a>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
