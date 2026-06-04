import { cn } from '@/lib/cn';
import { KNOWN_CATEGORIES, type KnownCategory } from '@/lib/types';

export type CategoryFilterValue = KnownCategory | 'all';

const LABEL: Record<CategoryFilterValue, string> = {
  all: 'All',
  fashion: 'Fashion',
  electronics: 'Electronics',
  home: 'Home',
  skincare: 'Skincare',
  beauty: 'Beauty',
};

export function CategoryFilter({
  value,
  onChange,
  counts,
}: {
  value: CategoryFilterValue;
  onChange: (v: CategoryFilterValue) => void;
  counts?: Partial<Record<CategoryFilterValue, number>>;
}) {
  const options: CategoryFilterValue[] = ['all', ...KNOWN_CATEGORIES];
  return (
    <div role="tablist" aria-label="Category filter" className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt;
        const count = counts?.[opt];
        return (
          <button
            key={opt}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
              active
                ? 'bg-mngmnt-ink text-mngmnt-paper'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200',
            )}
          >
            {LABEL[opt]}
            {typeof count === 'number' && count > 0 ? (
              <span
                className={cn(
                  'rounded-full px-1 text-[10px] font-bold tabular-nums',
                  active ? 'text-stone-300' : 'text-stone-500',
                )}
              >
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryFilter;
