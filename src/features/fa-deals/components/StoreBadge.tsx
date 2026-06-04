import { cn } from '@/lib/cn';
import { storeMetaFor } from '@/features/fa-deals/lib/storeMeta';

export function StoreBadge({
  store,
  className,
}: {
  store: string | null | undefined;
  className?: string;
}) {
  const meta = storeMetaFor(store);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
        meta.pill,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

export default StoreBadge;
