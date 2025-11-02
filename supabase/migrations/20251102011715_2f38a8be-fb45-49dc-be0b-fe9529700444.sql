-- Add color customization fields to store_config table
ALTER TABLE store_config
ADD COLUMN primary_color TEXT DEFAULT '#e91e8c',
ADD COLUMN header_bg_color TEXT DEFAULT '#ffffff',
ADD COLUMN header_text_color TEXT DEFAULT '#000000',
ADD COLUMN footer_bg_color TEXT DEFAULT '#f8f9fa',
ADD COLUMN footer_text_color TEXT DEFAULT '#6c757d',
ADD COLUMN product_title_color TEXT DEFAULT '#1a1a1a',
ADD COLUMN product_price_color TEXT DEFAULT '#e91e8c',
ADD COLUMN button_text_color TEXT DEFAULT '#ffffff';