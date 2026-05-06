import { Check } from 'lucide-react';

interface Props { draft: any; update: (p: any) => void; }

const FONTS = [
  { id: 'Rubik', label: 'Rubik', sample: 'Aa', family: "'Rubik', sans-serif" },
  { id: 'Inter', label: 'Inter', sample: 'Aa', family: "'Inter', sans-serif" },
  { id: 'Playfair', label: 'Playfair', sample: 'Aa', family: "'Playfair Display', serif" },
  { id: 'Lato', label: 'Lato', sample: 'Aa', family: "'Lato', sans-serif" },
  { id: 'Poppins', label: 'Poppins', sample: 'Aa', family: "'Poppins', sans-serif" },
  { id: 'Montserrat', label: 'Montserrat', sample: 'Aa', family: "'Montserrat', sans-serif" },
];

export const TypographyPanel = ({ draft, update }: Props) => {
  const current = draft.font_family || 'Rubik';
  return (
    <div className="grid grid-cols-3 gap-3 pb-6">
      {FONTS.map((f) => {
        const active = current === f.id;
        return (
          <button
            key={f.id}
            onClick={() => update({ font_family: f.id })}
            className={`relative p-4 rounded-2xl border-2 transition-all ${active ? 'border-primary' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
          >
            {active && <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />}
            <div className="text-3xl font-semibold mb-2" style={{ fontFamily: f.family }}>{f.sample}</div>
            <div className="text-xs text-slate-600">{f.label}</div>
          </button>
        );
      })}
    </div>
  );
};
