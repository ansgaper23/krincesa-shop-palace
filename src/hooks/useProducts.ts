
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/types/database';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Fetching products...');
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      console.log('Products fetched:', data?.length);
      return data as any;
    },
    staleTime: 0,
    gcTime: 0,
  });
};

export const useAllProducts = () => {
  return useQuery({
    queryKey: ['all-products'],
    queryFn: async () => {
      console.log('Fetching all products...');
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all products:', error);
        throw error;
      }
      
      console.log('All products fetched:', data?.length);
      return data as any;
    },
    staleTime: 0,
    gcTime: 0,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      console.log('Fetching product:', id);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
      
      console.log('Product fetched:', data?.name);
      return data as any;
    },
    staleTime: 0,
    gcTime: 0,
  });
};

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['product-by-slug', slug],
    queryFn: async () => {
      console.log('Fetching product by slug:', slug);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching product by slug:', error);
        throw error;
      }
      
      console.log('Product by slug fetched:', data?.name);
      return data as any;
    },
    staleTime: 0,
    gcTime: 0,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('Fetching categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      console.log('Categories fetched:', data?.length);
      return data as Category[];
    },
  });
};

export const useCoupon = (code: string) => {
  return useQuery({
    queryKey: ['coupon', code],
    queryFn: async () => {
      if (!code) return null;
      
      console.log('Fetching coupon:', code);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching coupon:', error);
        throw error;
      }
      
      console.log('Coupon fetched:', data?.code);
      return data;
    },
    enabled: !!code,
  });
};

export const useStoreConfig = () => {
  return useQuery({
    queryKey: ['store-config'],
    queryFn: async () => {
      console.log('Fetching store config...');
      const { data, error } = await supabase
        .from('store_config')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching store config:', error);
        throw error;
      }
      
      const config = data && data.length > 0 ? data[0] : null;
      console.log('Store config fetched:', config?.store_name);
      return config;
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
