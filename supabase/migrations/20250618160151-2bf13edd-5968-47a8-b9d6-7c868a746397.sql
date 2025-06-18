
-- Agregar columna slug a la tabla products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Crear función para generar slug desde el nombre (sin unaccent)
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          -- Reemplazar caracteres especiales manualmente
          translate(
            input_text,
            'áàäâéèëêíìïîóòöôúùüûñçÁÀÄÂÉÈËÊÍÌÏÎÓÒÖÔÚÙÜÛÑÇ',
            'aaaaeeeeiiiioooouuuuncAAAAEEEEIIIIOOOOUUUUNC'
          ), 
          '[^a-zA-Z0-9\s-]', '', 'g'
        ), 
        '\s+', '-', 'g'
      ), 
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Actualizar productos existentes con slugs basados en sus nombres
UPDATE products 
SET slug = generate_slug(name) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL;

-- Hacer que la columna slug sea obligatoria y única
ALTER TABLE products 
ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products(slug);

-- Crear trigger para generar slug automáticamente al insertar/actualizar
CREATE OR REPLACE FUNCTION set_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo generar slug si no existe o si el nombre cambió
  IF NEW.slug IS NULL OR (OLD.name IS DISTINCT FROM NEW.name) THEN
    NEW.slug := generate_slug(NEW.name) || '-' || substr(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_product_slug ON products;
CREATE TRIGGER trigger_set_product_slug
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_product_slug();
