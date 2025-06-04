
export interface Product {
  id: string;
  name: string;
  description: string | null;
  brand: string | null;
  category_id: string | null;
  price: number;
  wholesale_price: number;
  min_wholesale_quantity: number;
  image_url: string | null;
  additional_images: string[] | null;
  show_dozen_message: boolean | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number | null;
  is_active: boolean | null;
  expires_at: string | null;
}

export interface StoreConfig {
  id: string;
  store_name: string;
  logo_url: string | null;
  email: string | null;
  whatsapp_number: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  terms_and_conditions: string | null;
  privacy_policy: string | null;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
