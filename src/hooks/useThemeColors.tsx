import { useEffect, useState } from 'react';
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

const applyTheme = (cfg: any) => {
  if (!cfg) return;
  const root = document.documentElement;
  if (cfg.primary_color) root.style.setProperty('--theme-primary', cfg.primary_color);
  if (cfg.header_bg_color) root.style.setProperty('--theme-header-bg', cfg.header_bg_color);
  if (cfg.header_text_color) root.style.setProperty('--theme-header-text', cfg.header_text_color);
  if (cfg.footer_bg_color) root.style.setProperty('--theme-footer-bg', cfg.footer_bg_color);
  if (cfg.footer_text_color) root.style.setProperty('--theme-footer-text', cfg.footer_text_color);
  if (cfg.product_title_color) root.style.setProperty('--theme-product-title', cfg.product_title_color);
  if (cfg.product_price_color) root.style.setProperty('--theme-product-price', cfg.product_price_color);
  if (cfg.button_text_color) root.style.setProperty('--theme-button-text', cfg.button_text_color);

  const font = cfg.font_family || 'Rubik';
  ensureFontLoaded(font);
  const family = FONT_FAMILY[font] || FONT_FAMILY.Rubik;
  root.style.setProperty('--theme-font', family);
  document.body.style.fontFamily = family;

  const shape = cfg.button_shape || 'semi';
  root.style.setProperty('--theme-btn-radius', BUTTON_RADIUS[shape] || BUTTON_RADIUS.semi);
};

export const useThemeColors = () => {
  const { data: storeConfig } = useStoreConfig();
  const [previewOverride, setPreviewOverride] = useState<any>(null);

  useEffect(() => {
    applyTheme(previewOverride || storeConfig);
  }, [storeConfig, previewOverride]);

  // Listen for live preview messages from the design editor
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'design-preview') {
        setPreviewOverride(e.data.payload);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return previewOverride || storeConfig;
};
