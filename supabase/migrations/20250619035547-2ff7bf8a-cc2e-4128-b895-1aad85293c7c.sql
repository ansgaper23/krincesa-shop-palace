
-- Actualizar la función para generar slug basado en el nombre del producto
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
      '^-+|-+$', '', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Actualizar la función del trigger para crear slugs más legibles
CREATE OR REPLACE FUNCTION set_product_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Solo generar slug si no existe o si el nombre cambió
  IF NEW.slug IS NULL OR NEW.slug = '' OR (OLD IS NOT NULL AND OLD.name IS DISTINCT FROM NEW.name) THEN
    -- Generar slug base desde el nombre
    base_slug := generate_slug(NEW.name);
    
    -- Si el slug está vacío después de la limpieza, usar 'producto'
    IF base_slug = '' OR base_slug IS NULL THEN
      base_slug := 'producto';
    END IF;
    
    final_slug := base_slug;
    
    -- Verificar si el slug ya existe y agregar número si es necesario
    WHILE EXISTS (SELECT 1 FROM products WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Actualizar todos los productos existentes con slugs basados en sus nombres
UPDATE products 
SET slug = NULL 
WHERE slug IS NOT NULL;
