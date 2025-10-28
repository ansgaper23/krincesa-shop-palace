-- Ensure slug trigger exists and regenerate slugs from product names
-- Create trigger if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_product_slug_trigger'
  ) THEN
    CREATE TRIGGER set_product_slug_trigger
    BEFORE INSERT OR UPDATE OF name, slug ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.set_product_slug();
  END IF;
END $$;

-- Ensure unique index on slug
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='uq_products_slug'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX uq_products_slug ON public.products (slug)';
  END IF;
END $$;

-- Regenerate slugs for all existing products
UPDATE public.products
SET slug = NULL, updated_at = now();