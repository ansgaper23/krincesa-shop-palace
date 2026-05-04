
-- Hero slides
CREATE TABLE public.hero_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  button_text TEXT DEFAULT 'Comprar ahora',
  link_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active hero slides" ON public.hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert hero slides" ON public.hero_slides FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update hero slides" ON public.hero_slides FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete hero slides" ON public.hero_slides FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all hero slides" ON public.hero_slides FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Featured categories (circles)
CREATE TABLE public.featured_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  custom_name TEXT,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.featured_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active featured categories" ON public.featured_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert featured categories" ON public.featured_categories FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update featured categories" ON public.featured_categories FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete featured categories" ON public.featured_categories FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all featured categories" ON public.featured_categories FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Promo banners
CREATE TABLE public.promo_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  button_text TEXT DEFAULT 'Ver más',
  link_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active promo banners" ON public.promo_banners FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert promo banners" ON public.promo_banners FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update promo banners" ON public.promo_banners FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete promo banners" ON public.promo_banners FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all promo banners" ON public.promo_banners FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Benefits
CREATE TABLE public.benefits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon TEXT NOT NULL DEFAULT 'sparkles',
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active benefits" ON public.benefits FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can insert benefits" ON public.benefits FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update benefits" ON public.benefits FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete benefits" ON public.benefits FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all benefits" ON public.benefits FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers updated_at
CREATE TRIGGER update_hero_slides_updated_at BEFORE UPDATE ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_featured_categories_updated_at BEFORE UPDATE ON public.featured_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_promo_banners_updated_at BEFORE UPDATE ON public.promo_banners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_benefits_updated_at BEFORE UPDATE ON public.benefits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed beneficios por defecto
INSERT INTO public.benefits (icon, title, description, display_order) VALUES
  ('sparkles', 'Comodidad', 'Compra desde donde estés, en cualquier momento.', 1),
  ('shield', 'Seguridad', 'Pagos seguros y protección de datos personales.', 2),
  ('truck', 'Envíos a domicilio', 'Opciones de entrega a domicilio para mayor comodidad.', 3);
