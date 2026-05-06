ALTER TABLE public.store_config
  ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'Rubik',
  ADD COLUMN IF NOT EXISTS button_shape text DEFAULT 'semi',
  ADD COLUMN IF NOT EXISTS cart_icon text DEFAULT 'cart',
  ADD COLUMN IF NOT EXISTS section_order jsonb DEFAULT '["hero","categories","banner","products","benefits"]'::jsonb;