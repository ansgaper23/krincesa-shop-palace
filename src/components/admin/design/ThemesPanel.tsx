import { Check } from 'lucide-react';

interface Props { draft: any; update: (p: any) => void; }

const THEMES = [
  {
    id: 'pink',
    name: 'Rosa Glam',
    colors: { primary_color: '#e91e8c', button_text_color: '#ffffff', product_price_color: '#e91e8c', footer_bg_color: '#fce7f0' },
    swatch: ['#e91e8c', '#fce7f0', '#ffffff'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    colors: { primary_color: '#000000', button_text_color: '#ffffff', product_price_color: '#000000', footer_bg_color: '#f5f5f5' },
    swatch: ['#000000', '#f5f5f5', '#ffffff'],
  },
  {
    id: 'ocean',
    name: 'Océano',
    colors: { primary_color: '#0c2340', button_text_color: '#ffffff', product_price_color: '#2d8a9e', footer_bg_color: '#e8f0f8' },
    swatch: ['#0c2340', '#2d8a9e', '#e8f0f8'],
  },
  {
    id: 'sunset',
    name: 'Atardecer',
    colors: { primary_color: '#ff6b35', button_text_color: '#ffffff', product_price_color: '#e84393', footer_bg_color: '#fff4e6' },
    swatch: ['#ff6b35', '#e84393', '#fff4e6'],
  },
  {
    id: 'forest',
    name: 'Bosque',
    colors: { primary_color: '#2d5a3d', button_text_color: '#ffffff', product_price_color: '#2d5a3d', footer_bg_color: '#e8f0e9' },
    swatch: ['#2d5a3d', '#5a8a5c', '#e8f0e9'],
  },
  {
    id: 'gold',
    name: 'Lujo Dorado',
    colors: { primary_color: '#c9a84c', button_text_color: '#0d0d0d', product_price_color: '#c9a84c', footer_bg_color: '#1a1a1a', footer_text_color: '#c9a84c' },
    swatch: ['#0d0d0d', '#c9a84c', '#f0d78c'],
  },
];

export const ThemesPanel = ({ draft, update }: Props) => {
  const apply = (t: typeof THEMES[number]) => update(t.colors);
  const isActive = (t: typeof THEMES[number]) => draft.primary_color === t.colors.primary_color;

  return (
    <div className="grid grid-cols-2 gap-3 pb-6">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => apply(t)}
          className={`relative p-4 rounded-2xl border-2 text-left transition-all ${isActive(t) ? 'border-primary' : 'border-slate-200 hover:border-slate-300'}`}
        >
          {isActive(t) && <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />}
          <div className="flex gap-1 mb-3">
            {t.swatch.map((c) => (
              <div key={c} className="w-8 h-8 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="text-sm font-medium">{t.name}</div>
        </button>
      ))}
    </div>
  );
};
