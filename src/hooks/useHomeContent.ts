import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useHeroSlides = () => {
  return useQuery({
    queryKey: ['hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });
};

export const useFeaturedCategories = () => {
  return useQuery({
    queryKey: ['featured-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_categories')
        .select('*, categories(id, name)')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });
};

export const usePromoBanners = () => {
  return useQuery({
    queryKey: ['promo-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });
};

export const useBenefits = () => {
  return useQuery({
    queryKey: ['benefits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benefits')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });
};
