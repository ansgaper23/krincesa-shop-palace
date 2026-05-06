import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Image as ImageIcon, Grid3x3, Megaphone, Package, Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props { draft: any; update: (p: any) => void; }

const SECTION_META: Record<string, { label: string; Icon: any; href?: string }> = {
  hero: { label: 'Slider principal', Icon: ImageIcon, href: '/admin?tab=home&sub=hero_slides' },
  categories: { label: 'Categorías destacadas', Icon: Grid3x3, href: '/admin?tab=home&sub=featured_categories' },
  banner: { label: 'Banners promocionales', Icon: Megaphone, href: '/admin?tab=home&sub=promo_banners' },
  products: { label: 'Lista de productos', Icon: Package },
  benefits: { label: 'Beneficios', Icon: Sparkles, href: '/admin?tab=home&sub=benefits' },
};

const DEFAULT_ORDER = ['hero', 'categories', 'banner', 'products', 'benefits'];

export const SectionsPanel = ({ draft, update }: Props) => {
  const order: string[] = draft.section_order || DEFAULT_ORDER;

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const next = Array.from(order);
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    update({ section_order: next });
  };

  return (
    <div className="pb-6">
      <p className="text-xs text-slate-500 mb-3">Arrastra para reordenar. Toca una sección para editar su contenido.</p>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {order.map((key, idx) => {
                const meta = SECTION_META[key];
                if (!meta) return null;
                const Icon = meta.Icon;
                return (
                  <Draggable key={key} draggableId={key} index={idx}>
                    {(p, snap) => (
                      <div
                        ref={p.innerRef}
                        {...p.draggableProps}
                        className={`flex items-center gap-3 p-3 rounded-xl border bg-white ${snap.isDragging ? 'shadow-lg' : ''}`}
                      >
                        <div {...p.dragHandleProps} className="text-slate-400 cursor-grab active:cursor-grabbing">
                          <GripVertical className="h-5 w-5" />
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-slate-600" />
                        </div>
                        <span className="flex-1 text-sm font-medium">{meta.label}</span>
                        {meta.href && (
                          <Link to={meta.href} className="text-slate-400 hover:text-primary">
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="mt-4 p-3 rounded-xl bg-slate-50 text-xs text-slate-600">
        💡 Para editar contenido (imágenes, textos, banners), ve a <Link to="/admin" className="text-primary font-medium underline">Panel admin → Inicio</Link>.
      </div>
    </div>
  );
};
