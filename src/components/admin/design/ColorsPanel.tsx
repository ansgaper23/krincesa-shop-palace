import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Props { draft: any; update: (p: any) => void; }

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-2">
    <Label className="text-sm">{label}</Label>
    <div className="flex items-center gap-3 p-2 rounded-xl border bg-slate-50">
      <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="h-10 w-12 rounded-lg cursor-pointer border-0 bg-transparent" />
      <Input value={value || ''} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs" />
    </div>
  </div>
);

export const ColorsPanel = ({ draft, update }: Props) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
    <Field label="Color principal" value={draft.primary_color} onChange={(v) => update({ primary_color: v })} />
    <Field label="Texto en botones" value={draft.button_text_color} onChange={(v) => update({ button_text_color: v })} />
    <Field label="Fondo encabezado" value={draft.header_bg_color} onChange={(v) => update({ header_bg_color: v })} />
    <Field label="Texto encabezado" value={draft.header_text_color} onChange={(v) => update({ header_text_color: v })} />
    <Field label="Fondo pie de página" value={draft.footer_bg_color} onChange={(v) => update({ footer_bg_color: v })} />
    <Field label="Texto pie de página" value={draft.footer_text_color} onChange={(v) => update({ footer_text_color: v })} />
    <Field label="Título de productos" value={draft.product_title_color} onChange={(v) => update({ product_title_color: v })} />
    <Field label="Precio de productos" value={draft.product_price_color} onChange={(v) => update({ product_price_color: v })} />
  </div>
);
