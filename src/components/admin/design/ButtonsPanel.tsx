import { ShoppingCart, ShoppingBag, Plus, Square, Check } from 'lucide-react';

interface Props { draft: any; update: (p: any) => void; }

const SHAPES = [
  { id: 'square', label: 'Cuadrado', radius: '0px' },
  { id: 'semi', label: 'Semi', radius: '8px' },
  { id: 'full', label: 'Full', radius: '9999px' },
];

const ICONS = [
  { id: 'cart', label: 'Carrito', Icon: ShoppingCart },
  { id: 'plus', label: 'Suma', Icon: Plus },
  { id: 'bag', label: 'Bolsa', Icon: ShoppingBag },
];

export const ButtonsPanel = ({ draft, update }: Props) => {
  const shape = draft.button_shape || 'semi';
  const icon = draft.cart_icon || 'cart';
  return (
    <div className="space-y-6 pb-6">
      <div>
        <h4 className="text-sm font-semibold mb-3">Forma de botones</h4>
        <div className="grid grid-cols-3 gap-3">
          {SHAPES.map((s) => {
            const active = shape === s.id;
            return (
              <button
                key={s.id}
                onClick={() => update({ button_shape: s.id })}
                className={`relative p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all ${active ? 'border-primary' : 'border-slate-200 hover:border-slate-300'}`}
              >
                {active && <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />}
                <div className="w-10 h-10 border-2 border-slate-700" style={{ borderRadius: s.radius }} />
                <span className="text-xs">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" /> Ícono de carrito
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {ICONS.map((i) => {
            const active = icon === i.id;
            const I = i.Icon;
            return (
              <button
                key={i.id}
                onClick={() => update({ cart_icon: i.id })}
                className={`relative p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all ${active ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}
              >
                {active && <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />}
                <I className="h-7 w-7" />
                <span className="text-xs">{i.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
