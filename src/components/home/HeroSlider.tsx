import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHeroSlides } from '@/hooks/useHomeContent';
import { Button } from '@/components/ui/button';

export const HeroSlider = () => {
  const { data: slides } = useHeroSlides();
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  const current = slides[index];
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  const handleClick = () => {
    if (current.link_url) {
      if (current.link_url.startsWith('http')) {
        window.open(current.link_url, '_blank');
      } else {
        navigate(current.link_url);
      }
    }
  };

  return (
    <section className="container mx-auto px-2 sm:px-4 pt-4">
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] bg-muted">
        <img
          src={current.image_url}
          alt={current.title || 'Banner'}
          className="absolute inset-0 w-full h-full object-contain sm:object-cover transition-opacity duration-700"
          key={current.id}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8 text-center text-white">
          {current.title && (
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 drop-shadow-lg">
              {current.title}
            </h2>
          )}
          {current.button_text && (
            <Button
              onClick={handleClick}
              className="rounded-full px-6 sm:px-8 font-semibold uppercase tracking-wide"
              style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-button-text)' }}
            >
              {current.button_text}
            </Button>
          )}
        </div>

        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 sm:p-2 shadow-md"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 sm:p-2 shadow-md"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: i === index ? '20px' : '8px',
                    backgroundColor: i === index ? 'var(--theme-primary)' : 'rgba(255,255,255,0.7)',
                  }}
                  aria-label={`Ir a slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
