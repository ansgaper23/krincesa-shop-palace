
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  wholesalePrice: number;
  minWholesale: number;
  image: string;
  description: string;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);

  const isWholesale = quantity >= product.minWholesale;
  const currentPrice = isWholesale ? product.wholesalePrice : product.price;
  const total = currentPrice * quantity;

  const discountPercentage = Math.round(((product.price - product.wholesalePrice) / product.price) * 100);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {isWholesale && (
          <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">
            -{discountPercentage}% Por Mayor
          </Badge>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
        </div>
        
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 h-12">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3">
          {product.brand}
        </p>

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-pink-600">
              S/ {currentPrice.toFixed(2)}
            </span>
            {!isWholesale && (
              <span className="text-xs text-gray-500">
                Por mayor: S/ {product.wholesalePrice.toFixed(2)}
              </span>
            )}
          </div>
          
          {quantity >= product.minWholesale && (
            <p className="text-xs text-green-600 font-medium">
              Precio por mayor aplicado (3+ unidades)
            </p>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="h-8 w-8 p-0"
          >
            -
          </Button>
          <span className="px-3 py-1 border rounded text-sm min-w-[3rem] text-center">
            {quantity}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuantity(quantity + 1)}
            className="h-8 w-8 p-0"
          >
            +
          </Button>
        </div>

        {/* Total and Add to Cart */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-800">
            Total: S/ {total.toFixed(2)}
          </span>
          <Button 
            size="sm" 
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Añadir
          </Button>
        </div>
      </div>
    </div>
  );
};
