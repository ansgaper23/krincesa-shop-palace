
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({
  categories,
  selectedCategory,
  onCategoryChange,
  isOpen,
  onClose,
}: SidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-white rounded-lg shadow-md p-6 h-fit",
        "fixed top-0 left-0 z-50 w-64 h-full transform transition-transform duration-300 md:relative md:transform-none md:z-auto md:w-64",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Mobile close button */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h2 className="text-lg font-bold text-gray-800">Categorías</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop title */}
        <h2 className="text-lg font-bold text-gray-800 mb-6 hidden md:block">
          Categorías de productos
        </h2>

        {/* Categories list */}
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                onCategoryChange(category);
                onClose(); // Close sidebar on mobile after selection
              }}
              className={cn(
                "w-full text-left px-4 py-2 rounded-md transition-colors duration-200",
                "hover:bg-pink-50 hover:text-pink-600",
                selectedCategory === category
                  ? "bg-pink-500 text-white"
                  : "text-gray-700"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Brands section */}
        <div className="mt-8">
          <h3 className="text-md font-semibold text-gray-800 mb-4">Marcas</h3>
          <div className="space-y-2">
            {["Flower Secret", "Kawai", "Beauty Tools", "Todas las marcas"].map((brand) => (
              <button
                key={brand}
                className="w-full text-left px-4 py-2 rounded-md text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-8 p-4 bg-pink-50 rounded-lg">
          <h3 className="font-semibold text-pink-600 mb-2">¿Necesitas ayuda?</h3>
          <p className="text-sm text-gray-600 mb-2">
            Contáctanos por WhatsApp
          </p>
          <Button 
            size="sm" 
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            💬 WhatsApp
          </Button>
        </div>
      </aside>
    </>
  );
};
