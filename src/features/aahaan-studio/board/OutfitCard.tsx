import type { DailyOutfit } from '@/lib/types';
import { cn } from '@/lib/cn';
import { metaForStatus } from '@/features/aahaan-studio/lib/status';

export interface OutfitCardProps {
  outfit: DailyOutfit;
  onOpen: (outfit: DailyOutfit) => void;
}

/**
 * Builds the 2-line spec preview joining the three primary garment
 * fields with a middot. Filters empty values so we don't render
 * "·  · sneakers" with stray separators.
 */
function specPreview(outfit: DailyOutfit): string {
  return [outfit.top, outfit.bottom, outfit.footwear]
    .filter((s) => typeof s === 'string' && s.trim().length > 0)
    .join(' · ');
}

function dateLabel(outfit: DailyOutfit): string {
  if (!outfit.outfit_date) return '';
  // Format as e.g. "Jun 4" — short, local; the year is implied for the
  // current pipeline. Falls back to the raw value if parsing fails.
  const d = new Date(outfit.outfit_date);
  if (Number.isNaN(d.getTime())) return outfit.outfit_date;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function OutfitCard({ outfit, onOpen }: OutfitCardProps) {
  const meta = metaForStatus(outfit.status);
  const date = dateLabel(outfit);
  const spec = specPreview(outfit);

  return (
    <button
      type="button"
      onClick={() => onOpen(outfit)}
      className={cn(
        'group relative w-full overflow-hidden rounded-lg border border-stone-200 border-l-4 bg-white p-3 text-left shadow-soft transition-all',
        'hover:-translate-y-0.5 hover:shadow-card motion-reduce:hover:translate-y-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
        meta.spine,
      )}
    >
      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-stone-900">
        {outfit.title || 'Untitled look'}
      </h3>
      <p className="mt-1 text-[11px] text-stone-500">
        {date ? <span>{date}</span> : null}
        {date && outfit.outfit_no !== null ? <span aria-hidden> · </span> : null}
        {outfit.outfit_no !== null ? <span>#{outfit.outfit_no}</span> : null}
      </p>
      {spec ? (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-600">
          {spec}
        </p>
      ) : null}
    </button>
  );
}

export default OutfitCard;
