import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories, useProducts, useStoreConfig } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MessageCircle, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
const Index = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const {
    data: categories
  } = useCategories();
  const {
    data: products
  } = useProducts();
  const {
    data: storeConfig
  } = useStoreConfig();

  // Check for admin access code - support both "supersu" and "superu"
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (term === "supersu" || term === "superu") {
      navigate("/admin");
    }
  }, [searchTerm, navigate]);
  const filteredProducts = products?.filter(product => {
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && product.is_active;
  }) || [];
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Solo mostrar header cuando estamos completamente en el tope
      if (currentScrollY > 50) {
        setHideHeader(true);
      } else {
        setHideHeader(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  const handleWhatsAppHelp = () => {
    const whatsappNumber = storeConfig?.whatsapp_number || "+51999999999";
    const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
    const message = "Hola! Necesito ayuda, pueden ayudarme?";
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };
  return <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar - Mobile Optimized */}
      <header className={`bg-background border-b sticky top-0 z-40 transition-all duration-500 ease-in-out ${hideHeader ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="container mx-auto px-4 py-3">
          {/* Top Row: Search and WhatsApp */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)}>
              <Search className="h-6 w-6" />
            </Button>

            
          </div>

          {/* Search Bar */}
          {showSearch && <div className="mb-4">
              <Input type="text" placeholder="Buscar productos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full" />
            </div>}

          {/* Logo and Store Info - Ocultar cuando hay búsqueda activa */}
          {!showSearch && <div className="text-center mb-4">
              {storeConfig?.logo_url ? <img src={storeConfig.logo_url} alt={storeConfig.store_name} className="h-24 w-24 mx-auto rounded-full object-cover mb-3" /> : <div className="h-24 w-24 mx-auto rounded-full bg-pink-500 flex items-center justify-center mb-3">
                  <span className="text-white text-3xl font-bold">
                    {storeConfig?.store_name?.charAt(0) || 'K'}
                  </span>
                </div>}
              <h1 className="text-xl font-bold mb-1">
                {storeConfig?.store_name || 'Krincesa Distribuidora'}
              </h1>
              <p className="text-sm text-muted-foreground px-4">
                {storeConfig?.site_description || 'Descubre nuestra amplia selección de productos de calidad'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                📍 Lima, Cañete
              </p>
            </div>}
        </div>
      </header>

      {/* Horizontal Scrollable Categories */}
      <div className="bg-background border-b py-4 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 pb-2 min-w-min">
              <Button variant={!selectedCategory ? "default" : "outline"} onClick={() => setSelectedCategory(null)} className="rounded-full shrink-0">
                Todos
              </Button>
              {categories?.map(category => <Button key={category.id} variant={selectedCategory === category.id ? "default" : "outline"} onClick={() => setSelectedCategory(category.id)} className="rounded-full shrink-0">
                  {category.name}
                </Button>)}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {filteredProducts.length === 0 ? <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No se encontraron productos</p>
          </div> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
          </div>}
      </main>

      {/* WhatsApp Help Button - Bottom Left */}
      <Button onClick={handleWhatsAppHelp} className="fixed bottom-4 left-4 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full w-14 h-14 p-0 shadow-lg flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </Button>

      <Footer />
    </div>;
};
export default Index;