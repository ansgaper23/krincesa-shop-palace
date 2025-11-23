-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price numeric NOT NULL,
  wholesale_price numeric NOT NULL,
  min_wholesale_quantity numeric NOT NULL DEFAULT 12,
  stock numeric NOT NULL DEFAULT 0,
  image_url text,
  additional_images text[],
  brand text,
  category_id uuid REFERENCES public.categories(id),
  is_active boolean DEFAULT true,
  show_dozen_message boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL,
  discount_value numeric NOT NULL,
  min_order_amount numeric,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  province text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  total_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  product_name text NOT NULL,
  product_price numeric NOT NULL,
  quantity numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create store_config table
CREATE TABLE IF NOT EXISTS public.store_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name text NOT NULL DEFAULT 'Mi Tienda',
  site_description text,
  logo_url text,
  whatsapp_number text,
  whatsapp_message_template text,
  email text,
  facebook_url text,
  instagram_url text,
  tiktok_url text,
  privacy_policy text,
  terms_and_conditions text,
  primary_color text,
  header_bg_color text,
  header_text_color text,
  footer_bg_color text,
  footer_text_color text,
  product_title_color text,
  product_price_color text,
  button_text_color text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read access for store data
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view store config" ON public.store_config FOR SELECT USING (true);

-- RLS Policies - Public can create orders
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT USING (true);

-- RLS Policies - Public can update orders and store config
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Anyone can update store config" ON public.store_config FOR UPDATE USING (true);

-- RLS Policies - Admin operations (using service role for now)
CREATE POLICY "Service role can manage categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Service role can manage products" ON public.products FOR ALL USING (true);
CREATE POLICY "Service role can manage coupons" ON public.coupons FOR ALL USING (true);
CREATE POLICY "Service role can manage store config" ON public.store_config FOR ALL USING (true);

-- Create function to generate slug
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  slug text;
BEGIN
  -- Convert to lowercase and replace spaces with hyphens
  slug := lower(trim(input_text));
  slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
  slug := regexp_replace(slug, '\s+', '-', 'g');
  slug := regexp_replace(slug, '-+', '-', 'g');
  RETURN slug;
END;
$$;

-- Create trigger to update updated_at on products
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Create view for product sales stats
CREATE OR REPLACE VIEW public.product_sales_stats AS
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

-- Create storage buckets for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');