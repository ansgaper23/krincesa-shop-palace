-- Fix security issues from previous migration

-- Drop and recreate generate_slug function with proper security settings
DROP FUNCTION IF EXISTS public.generate_slug(text);
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slug text;
BEGIN
  slug := lower(trim(input_text));
  slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  RETURN slug;
END;
$$;

-- Drop and recreate update_updated_at_column function with proper security settings
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_config_updated_at
BEFORE UPDATE ON public.store_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Drop and recreate view without SECURITY DEFINER (views are SECURITY INVOKER by default)
DROP VIEW IF EXISTS public.product_sales_stats;
CREATE VIEW public.product_sales_stats 
WITH (security_invoker=true) AS
SELECT 
  p.id,
  p.name,
  p.price,
  p.stock,
  p.image_url,
  COALESCE(SUM(oi.quantity), 0)::bigint AS total_sold,
  COALESCE(SUM(oi.total_price), 0) AS total_revenue,
  COUNT(DISTINCT oi.order_id)::bigint AS order_count
FROM public.products p
LEFT JOIN public.order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name, p.price, p.stock, p.image_url;