import { useEffect } from 'react';
import { useStoreConfig } from './useProducts';

const FONT_LINKS: Record<string, string> = {
  Rubik: 'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap',
  Inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  Playfair: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap',
  Lato: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap',
  Poppins: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  Montserrat: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap',
};

const FONT_FAMILY: Record<string, string> = {
  Rubik: "'Rubik', system-ui, sans-serif",
  Inter: "'Inter', system-ui, sans-serif",
  Playfair: "'Playfair Display', Georgia, serif",
  Lato: "'Lato', system-ui, sans-serif",
  Poppins: "'Poppins', system-ui, sans-serif",
  Montserrat: "'Montserrat', system-ui, sans-serif",
};

const BUTTON_RADIUS: Record<string, string> = {
  square: '0px',
  semi: '8px',
  full: '9999px',
};

const ensureFontLoaded = (font: string) => {
  const href = FONT_LINKS[font];
  if (!href) return;
  const id = `font-${font}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
};

export const useThemeColors = () => {
  const { data: storeConfig } = useStoreConfig();

  useEffect(() => {
    if (!storeConfig) return;
    const root = document.documentElement;
    const cfg: any = storeConfig;

    root.style.setProperty('--theme-primary', cfg.primary_color || '#e91e8c');
    root.style.setProperty('--theme-header-bg', cfg.header_bg_color || '#ffffff');
    root.style.setProperty('--theme-header-text', cfg.header_text_color || '#000000');
    root.style.setProperty('--theme-footer-bg', cfg.footer_bg_color || '#f8f9fa');
    root.style.setProperty('--theme-footer-text', cfg.footer_text_color || '#6c757d');
    root.style.setProperty('--theme-product-title', cfg.product_title_color || '#1a1a1a');
    root.style.setProperty('--theme-product-price', cfg.product_price_color || '#e91e8c');
    root.style.setProperty('--theme-button-text', cfg.button_text_color || '#ffffff');

    const font = cfg.font_family || 'Rubik';
    ensureFontLoaded(font);
    root.style.setProperty('--theme-font', FONT_FAMILY[font] || FONT_FAMILY.Rubik);
    document.body.style.fontFamily = FONT_FAMILY[font] || FONT_FAMILY.Rubik;

    const shape = cfg.button_shape || 'semi';
    root.style.setProperty('--theme-btn-radius', BUTTON_RADIUS[shape] || BUTTON_RADIUS.semi);
  }, [storeConfig]);

  return storeConfig;
};
