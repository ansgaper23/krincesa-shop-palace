-- 1) Add province column to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS province text;

-- 2) Ensure product slug trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_product_slug_trigger'
  ) THEN
    CREATE TRIGGER set_product_slug_trigger
    BEFORE INSERT OR UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.set_product_slug();
  END IF;
END $$;

-- 3) Re-generate slugs for existing products from their names
-- Setting slug to NULL so the BEFORE UPDATE trigger assigns the correct slug
UPDATE public.products SET slug = NULL;
