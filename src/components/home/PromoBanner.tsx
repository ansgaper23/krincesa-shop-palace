import { useNavigate } from 'react-router-dom';
import { usePromoBanners } from '@/hooks/useHomeContent';
import { Button } from '@/components/ui/button';

export const PromoBanner = () => {
  const { data: banners } = usePromoBanners();
  const navigate = useNavigate();

  if (!banners || banners.length === 0) return null;

  const handleClick = (link?: string | null) => {
    if (!link) return;
    if (link.startsWith('http')) window.open(link, '_blank');
    else navigate(link);
  };

  return (
    <section className="container mx-auto px-4 py-6 sm:py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {banners.map((b: any) => (
          <div key={b.id} className="relative rounded-2xl overflow-hidden aspect-[16/10] group cursor-pointer" onClick={() => handleClick(b.link_url)}>
            <img src={b.image_url} alt={b.title || 'Promo'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 text-white">
              {b.title && <h3 className="text-lg sm:text-2xl font-bold mb-2 drop-shadow-lg">{b.title}</h3>}
              {b.button_text && (
                <Button
                  size="sm"
                  className="rounded-full font-semibold"
                  style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-button-text)' }}
                >
                  {b.button_text}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
