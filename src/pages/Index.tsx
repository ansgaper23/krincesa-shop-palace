
import { useState } from "react";
import { useCategories, useProducts, useStoreConfig } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MessageCircle, Menu, Search, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: categories } = useCategories();
  const { data: products } = useProducts();
  const { data: storeConfig } = useStoreConfig();

  const filteredProducts = products?.filter((product) => {
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch && product.is_active;
  }) || [];

  const handleWhatsAppHelp = () => {
    const whatsappNumber = storeConfig?.whatsapp_number || "+51999999999";
    const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
    const message = encodeURIComponent("¡Hola! Necesito ayuda, ¿pueden ayudarme?");
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar - Mobile Optimized */}
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          {/* Top Row: Menu, Search, Icons */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <Search className="h-6 w-6" />
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <MessageCircle className="h-6 w-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleWhatsAppHelp}
              >
                <MessageCircle className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Logo and Store Info */}
          <div className="text-center mb-4">
            {storeConfig?.logo_url ? (
              <img
                src={storeConfig.logo_url}
                alt={storeConfig.store_name}
                className="h-24 w-24 mx-auto rounded-full object-cover mb-3"
              />
            ) : (
              <div className="h-24 w-24 mx-auto rounded-full bg-pink-500 flex items-center justify-center mb-3">
                <span className="text-white text-3xl font-bold">
                  {storeConfig?.store_name?.charAt(0) || 'K'}
                </span>
              </div>
            )}
            <h1 className="text-xl font-bold mb-1">
              {storeConfig?.store_name || 'Krincesa Distribuidora'}
            </h1>
            <p className="text-sm text-muted-foreground px-4">
              {storeConfig?.site_description || 'Descubre nuestra amplia selección de productos de calidad'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              📍 Lima, Cañete
            </p>
          </div>
        </div>
      </header>

      {/* Horizontal Scrollable Categories */}
      <div className="bg-background border-b py-4 sticky top-[200px] z-30">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-semibold mb-3 text-pink-600">
            Categorías principales
          </h2>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-2">
              <Button
                variant={!selectedCategory ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className="rounded-full shrink-0"
              >
                Todos
              </Button>
              {categories?.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="rounded-full shrink-0"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Products Grid */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* WhatsApp Help Button - Bottom Left */}
      <Button
        onClick={handleWhatsAppHelp}
        className="fixed bottom-4 left-4 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 p-0 shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <Footer />
    </div>
  );
};

export default Index;
