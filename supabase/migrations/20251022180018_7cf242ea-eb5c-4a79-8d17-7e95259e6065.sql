-- Añadir campo de stock/cantidad a productos
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock integer DEFAULT 0 NOT NULL;

-- Añadir índice para mejorar performance en consultas de stock
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock);

-- Crear vista para productos más vendidos
CREATE OR REPLACE VIEW public.product_sales_stats AS
SELECT 
  p.id,
  p.name,
  p.image_url,
  p.price,
  p.stock,
  COALESCE(SUM(oi.quantity), 0) as total_sold,
  COALESCE(SUM(oi.total_price), 0) as total_revenue,
  COUNT(DISTINCT oi.order_id) as order_count
FROM public.products p
LEFT JOIN public.order_items oi ON p.id = oi.product_id
LEFT JOIN public.orders o ON oi.order_id = o.id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.image_url, p.price, p.stock
ORDER BY total_sold DESC;