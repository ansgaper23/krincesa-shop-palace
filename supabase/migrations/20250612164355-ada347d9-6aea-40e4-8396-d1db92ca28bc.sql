
-- Agregar columna para almacenar el nombre del producto en order_items
-- para mantener el historial incluso si se elimina el producto
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_name TEXT;

-- Actualizar los registros existentes con el nombre del producto
UPDATE order_items 
SET product_name = products.name 
FROM products 
WHERE order_items.product_id = products.id 
AND order_items.product_name IS NULL;

-- Hacer que product_name sea obligatorio para nuevos registros
ALTER TABLE order_items 
ALTER COLUMN product_name SET NOT NULL;

-- Cambiar la relación de product_id para que permita eliminación
-- (SET NULL en lugar de RESTRICT)
ALTER TABLE order_items 
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE order_items 
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES products(id) 
ON DELETE SET NULL;

-- Permitir que product_id sea NULL para productos eliminados
ALTER TABLE order_items 
ALTER COLUMN product_id DROP NOT NULL;
