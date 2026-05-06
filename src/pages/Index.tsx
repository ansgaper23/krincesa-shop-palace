import { useState, useEffect, useRef } from 'react';
import { useCategories, useProducts, useStoreConfig } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { ProductQuickView } from '@/components/ProductQuickView';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { HeroSlider } from '@/components/home/HeroSlider';
import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { PromoBanner } from '@/components/home/PromoBanner';
import { BenefitsSection } from '@/components/home/BenefitsSection';
import { Product, Category } from '@/types/database';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const [quickViewProduct, setQuickViewProduct] = useState<(Product & { categories: Category | null }) | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts();
  const { data: storeConfig } = useStoreConfig();

  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const tokens = normalize(searchTerm).split(/\s+/).filter(Boolean);

  const filteredProducts =
    products?.filter((product: any) => {
      const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
      if (!product.is_active) return false;
      if (tokens.length === 0) return matchesCategory;
      const haystack = normalize(
        [
          product.name,
          product.description || '',
          product.brand || '',
          product.slug || '',
          product.categories?.name || '',
        ].join(' ')
      );
      const matchesSearch = tokens.every((t) => haystack.includes(t));
      return matchesCategory && matchesSearch;
    }) || [];

  const displayedProducts = !selectedCategory ? filteredProducts.slice(0, visibleCount) : filteredProducts;

  useEffect(() => {
    setVisibleCount(20);
  }, [selectedCategory, searchTerm]);

  useEffect(() => {
    if (selectedCategory) return;
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 16, filteredProducts.length));
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filteredProducts.length, selectedCategory]);

  const handleWhatsAppHelp = () => {
    const whatsappNumber = storeConfig?.whatsapp_number || '+51999999999';
    const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
    const message = 'Hola Krincesa Distribuidora 😊👑💖👋🏻\nDeseo...';
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const showHero = !searchTerm && !selectedCategory;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectCategory={setSelectedCategory}
      />

      {(() => {
        const order: string[] = (storeConfig as any)?.section_order || ['hero', 'categories', 'banner', 'products', 'benefits'];
        const renderSection = (key: string) => {
          if (key === 'hero' && showHero) return <HeroSlider key="hero" />;
          if (key === 'categories' && showHero) return <FeaturedCategories key="categories" onSelectCategory={setSelectedCategory} />;
          if (key === 'banner' && showHero) return <PromoBanner key="banner" />;
          if (key === 'benefits' && showHero) return <BenefitsSection key="benefits" />;
          if (key === 'products') {
            return (
              <div key="products">
                {/* Category pills */}
                <div className="bg-background border-b py-3 sticky top-[72px] md:top-[76px] z-30">
                  <div className="container mx-auto px-4">
                    <div className="overflow-x-auto scrollbar-hide">
                      <div className="flex gap-2 pb-1 min-w-min">
                        <Button
                          size="sm"
                          variant={!selectedCategory ? 'default' : 'outline'}
                          onClick={() => setSelectedCategory(null)}
                          className="rounded-full shrink-0 text-sm"
                          style={!selectedCategory ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-button-text)' } : undefined}
                        >
                          Todos
                        </Button>
                        {categories?.map((category) => (
                          <Button
                            key={category.id}
                            size="sm"
                            variant={selectedCategory === category.id ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(category.id)}
                            className="rounded-full shrink-0 text-sm"
                            style={selectedCategory === category.id ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-button-text)' } : undefined}
                          >
                            {category.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <main id="products-grid" className="flex-1 container mx-auto px-4 py-6">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center" style={{ color: 'var(--theme-product-title)' }}>
                    {selectedCategory ? categories?.find((c) => c.id === selectedCategory)?.name : 'Productos'}
                  </h2>

                  {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {Array.from({ length: 20 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                  ) : displayedProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground text-lg">No se encontraron productos</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {displayedProducts.map((product, index) => (
                          <div
                            key={product.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${Math.min(index * 50, 500)}ms`, animationFillMode: 'both' }}
                          >
                            <ProductCard product={product} onQuickView={setQuickViewProduct} />
                          </div>
                        ))}
                      </div>
                      {!selectedCategory && displayedProducts.length < filteredProducts.length && (
                        <div ref={loaderRef} className="h-10" />
                      )}
                    </>
                  )}
                </main>
              </div>
            );
          }
          return null;
        };
        return order.map(renderSection);
      })()}

      {/* WhatsApp floating */}
      <Button
        onClick={handleWhatsAppHelp}
        className="fixed bottom-4 left-4 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full w-14 h-14 p-0 shadow-lg flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </Button>

      <ProductQuickView
        product={quickViewProduct}
        open={!!quickViewProduct}
        onOpenChange={(open) => {
          if (!open) setQuickViewProduct(null);
        }}
      />

      <Footer />
    </div>
  );
};

export default Index;
