
import { useState } from "react";
import { useCategories, useProducts, useStoreConfig } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { Sidebar } from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        <Sidebar
          categories={categories || []}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {selectedCategory 
                ? categories?.find(c => c.id === selectedCategory)?.name 
                : "Todos los productos"
              }
            </h1>
            <p className="text-gray-600">
              {storeConfig?.site_description || 'Descubre nuestra amplia selección de productos de calidad'}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* WhatsApp Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleWhatsAppHelp}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg"
          size="lg"
        >
          <MessageCircle className="h-6 w-6 mr-2" />
          ¿Necesitas ayuda?
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
