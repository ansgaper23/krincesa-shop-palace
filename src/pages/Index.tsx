
import { useState } from "react";
import { Search, ShoppingCart, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { getItemCount, getTotal } = useCart();

  // Agregar "Todas" al inicio de las categorías
  const allCategories = ["Todas", ...categories.map(cat => cat.name)];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.categories?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || 
                           (product.categories?.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-pink-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-lg font-bold text-xl">
                👑 Krincesa
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-gray-700 hover:text-pink-500 font-medium">Tienda</a>
              <a href="#" className="text-gray-700 hover:text-pink-500 font-medium">Nosotros</a>
              <a href="#" className="text-gray-700 hover:text-pink-500 font-medium">Contactanos</a>
            </nav>

            {/* Search and Cart */}
            <div className="flex items-center space-x-4">
              <Link to="/cart">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {getItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </Button>
              </Link>
              <span className="text-sm">S/ {getTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative max-w-xl mx-auto">
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border-2 border-gray-200 focus:border-pink-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <Sidebar
            categories={allCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Tienda</h1>
              <p className="text-gray-600">Descubre nuestros productos de belleza y accesorios</p>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {!productsLoading && filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron productos</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-pink-600">Krincesa Distribuidora</h3>
              <p className="text-gray-600">Tu tienda de confianza para productos de belleza y accesorios.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contacto</h3>
              <div className="space-y-2 text-gray-600">
                <p>📱 WhatsApp: +51 999 999 999</p>
                <p>📧 Email: info@krincesa.com</p>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Síguenos</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-pink-500 hover:text-pink-600">Facebook</a>
                <a href="#" className="text-pink-500 hover:text-pink-600">Instagram</a>
                <a href="#" className="text-pink-500 hover:text-pink-600">TikTok</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
