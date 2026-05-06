import { ShoppingCart, ShoppingBag, Plus } from 'lucide-react';
import { useStoreConfig } from '@/hooks/useProducts';

export const CartIcon = ({ className }: { className?: string }) => {
  const { data: cfg } = useStoreConfig();
  const variant = (cfg as any)?.cart_icon || 'cart';
  if (variant === 'bag') return <ShoppingBag className={className} />;
  if (variant === 'plus') return <Plus className={className} />;
  return <ShoppingCart className={className} />;
};
