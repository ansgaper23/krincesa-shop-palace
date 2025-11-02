import { useEffect } from 'react';
import { useStoreConfig } from './useProducts';

export const useThemeColors = () => {
  const { data: storeConfig } = useStoreConfig();

  useEffect(() => {
    if (storeConfig) {
      const root = document.documentElement;
      
      // Apply custom colors as CSS variables
      root.style.setProperty('--theme-primary', storeConfig.primary_color || '#e91e8c');
      root.style.setProperty('--theme-header-bg', storeConfig.header_bg_color || '#ffffff');
      root.style.setProperty('--theme-header-text', storeConfig.header_text_color || '#000000');
      root.style.setProperty('--theme-footer-bg', storeConfig.footer_bg_color || '#f8f9fa');
      root.style.setProperty('--theme-footer-text', storeConfig.footer_text_color || '#6c757d');
      root.style.setProperty('--theme-product-title', storeConfig.product_title_color || '#1a1a1a');
      root.style.setProperty('--theme-product-price', storeConfig.product_price_color || '#e91e8c');
      root.style.setProperty('--theme-button-text', storeConfig.button_text_color || '#ffffff');
    }
  }, [storeConfig]);

  return storeConfig;
};
