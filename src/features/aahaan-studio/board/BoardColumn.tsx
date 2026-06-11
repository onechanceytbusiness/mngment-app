import type { DailyOutfit, OutfitStatus } from '@/lib/types';
import { cn } from '@/lib/cn';
import {
  EMPTY_HINT,
  metaForStatus,
} from '@/features/aahaan-studio/lib/status';
import { OutfitCard } from '@/features/aahaan-studio/board/OutfitCard';

export interface BoardColumnProps {
  status: OutfitStatus;
  outfits: DailyOutfit[];
  onOpenOutfit: (outfit: DailyOutfit) => void;
}

export function BoardColumn({ status, outfits, onOpenOutfit }: BoardColumnProps) {
  const meta = metaForStatus(status);
  const empty = outfits.length === 0;

  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-xl bg-stone-50 p-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span
            className={cn('h-2 w-2 rounded-full', meta.dot)}
            aria-hidden
          />
          <span className="text-xs font-semibold lowercase tracking-wide text-stone-700">
            {meta.label}
          </span>
        </div>
        <span className="text-xs font-medium tabular-nums text-stone-400">
          {outfits.length}
        </span>
      </div>

      {empty ? (
        <p className="rounded-md border border-dashed border-stone-200 px-3 py-6 text-center text-[11px] leading-relaxed text-stone-400">
          {EMPTY_HINT[status]}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {outfits.map((o) => (
            <OutfitCard key={o.id} outfit={o} onOpen={onOpenOutfit} />
          ))}
        </div>
      )}
    </div>
  );
}

export default BoardColumn;
