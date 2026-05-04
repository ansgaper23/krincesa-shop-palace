import { useBenefits } from '@/hooks/useHomeContent';
import { Sparkles, Shield, Truck, Heart, Star, Gift, Package, Tag } from 'lucide-react';

const ICONS: Record<string, any> = {
  sparkles: Sparkles,
  shield: Shield,
  truck: Truck,
  heart: Heart,
  star: Star,
  gift: Gift,
  package: Package,
  tag: Tag,
};

export const BenefitsSection = () => {
  const { data: benefits } = useBenefits();

  if (!benefits || benefits.length === 0) return null;

  return (
    <section className="py-10 sm:py-16" style={{ backgroundColor: 'var(--theme-footer-bg, #fce7f0)' }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {benefits.map((b: any) => {
            const Icon = ICONS[b.icon] || Sparkles;
            return (
              <div key={b.id} className="bg-white rounded-2xl p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-shadow">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
                  style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-button-text, #fff)' }}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">{b.title}</h3>
                {b.description && <p className="text-sm text-muted-foreground">{b.description}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
