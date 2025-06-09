
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface SidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const Sidebar = ({
  categories,
  selectedCategory,
  onCategorySelect,
  searchTerm,
  onSearchChange,
}: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar menú al presionar Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Cerrar menú al cambiar el tamaño de pantalla a desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCategorySelect = (categoryId: string | null) => {
    onCategorySelect(categoryId);
    setIsOpen(false); // Cerrar automáticamente después de seleccionar
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white shadow-md"
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Overlay for mobile - más grande y fácil de hacer clic */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden cursor-pointer"
          onClick={closeMenu}
          aria-label="Cerrar menú"
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-white rounded-lg shadow-md p-6 h-fit sticky top-6",
        "fixed top-0 left-0 z-50 w-80 h-full transform transition-transform duration-300 lg:relative lg:transform-none lg:z-auto lg:w-80 lg:h-fit",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header del sidebar móvil con botón de cerrar */}
        <div className="lg:hidden flex justify-between items-center mb-4 pb-2 border-b">
          <h2 className="text-lg font-bold text-gray-800">Menú</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeMenu}
            className="p-1 h-8 w-8"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Categorías</h2>
          <div className="space-y-2">
            <button
              onClick={() => handleCategorySelect(null)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-md transition-colors duration-200 text-sm",
                "hover:bg-pink-50 hover:text-pink-600 active:bg-pink-100",
                !selectedCategory
                  ? "bg-pink-500 text-white"
                  : "text-gray-700"
              )}
            >
              Todas las categorías
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-md transition-colors duration-200 text-sm",
                  "hover:bg-pink-50 hover:text-pink-600 active:bg-pink-100",
                  selectedCategory === category.id
                    ? "bg-pink-500 text-white"
                    : "text-gray-700"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Contact info */}
        <div className="p-4 bg-pink-50 rounded-lg">
          <h3 className="font-semibold text-pink-600 mb-2">¿Necesitas ayuda?</h3>
          <p className="text-sm text-gray-600 mb-2">
            Contáctanos por WhatsApp
          </p>
          <Button 
            size="sm" 
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            onClick={() => {
              const message = encodeURIComponent("¡Hola! Necesito ayuda, ¿pueden ayudarme?");
              window.open(`https://wa.me/+51999999999?text=${message}`, '_blank');
              closeMenu(); // Cerrar menú después de la acción
            }}
          >
            💬 WhatsApp
          </Button>
        </div>
      </aside>
    </>
  );
};
