import { useNavigate } from 'react-router-dom';
import { useFeaturedCategories } from '@/hooks/useHomeContent';

interface Props {
  onSelectCategory?: (categoryId: string) => void;
}

export const FeaturedCategories = ({ onSelectCategory }: Props) => {
  const { data: items } = useFeaturedCategories();
  const navigate = useNavigate();

  if (!items || items.length === 0) return null;

  const handleClick = (item: any) => {
    if (item.category_id && onSelectCategory) {
      onSelectCategory(item.category_id);
      window.scrollTo({ top: document.getElementById('products-grid')?.offsetTop ?? 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="container mx-auto px-4 py-8 sm:py-10">
      <div className="flex justify-center gap-6 sm:gap-10 overflow-x-auto scrollbar-hide pb-2">
        {items.map((item: any) => (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className="flex flex-col items-center gap-2 group shrink-0"
          >
            <div
              className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 transition-transform group-hover:scale-105"
              style={{ borderColor: 'var(--theme-primary)' }}
            >
              <img src={item.image_url} alt={item.custom_name || item.categories?.name || ''} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm sm:text-base font-medium text-foreground">
              {item.custom_name || item.categories?.name || ''}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
