
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, CartItem, Coupon } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  appliedCoupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const { toast } = useToast();

  const addToCart = (product: Product, quantity: number) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { product, quantity }];
      }
    });

    toast({
      title: "Añadido",
      description: `${product.name} x${quantity}`,
      duration: 1500,
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => {
      const price = item.quantity >= item.product.min_wholesale_quantity 
        ? item.product.wholesale_price 
        : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const applyCoupon = (coupon: Coupon) => {
    setAppliedCoupon(coupon);
    toast({
      title: "Cupón aplicado",
      description: `Descuento de ${coupon.discount_type === 'percentage' ? coupon.discount_value + '%' : 'S/ ' + coupon.discount_value}`,
    });
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    
    if (!appliedCoupon) return subtotal;
    
    if (appliedCoupon.min_order_amount && subtotal < appliedCoupon.min_order_amount) {
      return subtotal;
    }

    if (appliedCoupon.discount_type === 'percentage') {
      return subtotal - (subtotal * appliedCoupon.discount_value / 100);
    } else {
      return Math.max(0, subtotal - appliedCoupon.discount_value);
    }
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getSubtotal,
      getTotal,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      getItemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
