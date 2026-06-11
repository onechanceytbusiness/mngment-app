import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutGrid, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import { listOutfits } from '@/lib/api';
import type { DailyOutfit, OutfitStatus } from '@/lib/types';
import { OUTFIT_STATUSES } from '@/lib/types';
import { BoardColumn } from '@/features/aahaan-studio/board/BoardColumn';
import { OutfitDetailModal } from '@/features/aahaan-studio/board/OutfitDetailModal';

function todayIsoDate(): string {
  // Local date in ISO yyyy-mm-dd. Comparing against outfit_date (which is
  // a Postgres date, returned as 'YYYY-MM-DD' by Supabase) is then a
  // plain string equality.
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function BoardSkeleton() {
  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-4">
      {OUTFIT_STATUSES.map((s) => (
        <div
          key={s}
          className="flex w-72 shrink-0 flex-col gap-3 rounded-xl bg-stone-50 p-3"
        >
          <div className="flex items-center justify-between px-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-6" />
          </div>
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-stone-200 bg-white p-3 shadow-soft"
            >
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/3" />
              <Skeleton className="mt-2 h-3 w-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function BoardTab() {
  const toast = useToast();
  const [outfits, setOutfits] = useState<DailyOutfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<DailyOutfit | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listOutfits();
      setOutfits(rows);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load outfits';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  // Group outfits by status for the kanban columns.
  const grouped = useMemo(() => {
    const out: Record<OutfitStatus, DailyOutfit[]> = {
      idea: [],
      sourced: [],
      generated: [],
      edited: [],
      ready: [],
      posted: [],
    };
    for (const o of outfits) {
      // Defensive: if a row arrives with an unknown status, drop it into
      // the closest tier rather than crash. Practically the DB enum
      // prevents this — but the type system can't.
      if (out[o.status]) {
        out[o.status].push(o);
      } else {
        out.idea.push(o);
      }
    }
    return out;
  }, [outfits]);

  // Header counters.
  const total = outfits.length;
  const today = todayIsoDate();
  const todayCount = useMemo(
    () => outfits.filter((o) => o.outfit_date === today).length,
    [outfits, today],
  );

  // Optimistic helpers wired to the modal so the board reflects edits
  // without a full refetch.
  const handleSaved = (next: DailyOutfit) => {
    setOutfits((prev) => prev.map((o) => (o.id === next.id ? next : o)));
  };
  const handleDeleted = (id: string) => {
    setOutfits((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
            Studio · Board
          </p>
          <h2 className="mt-1 text-xl font-bold text-stone-900 md:text-2xl">
            {total === 0 ? 'No looks yet' : `${total} looks`}
            {todayCount > 0 ? (
              <span className="ml-2 align-middle text-sm font-medium text-stone-500">
                · {todayCount} today
              </span>
            ) : null}
          </h2>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchAll}
          loading={loading}
          leftIcon={<RefreshCw className="h-4 w-4" />}
          aria-label="Refresh board"
        >
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Body */}
      {loading && outfits.length === 0 ? (
        <BoardSkeleton />
      ) : error && outfits.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid className="h-7 w-7" />}
          title="Couldn’t load the board"
          description={error}
          action={
            <Button
              variant="primary"
              size="md"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={fetchAll}
            >
              Retry
            </Button>
          }
        />
      ) : (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-4">
          {OUTFIT_STATUSES.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              outfits={grouped[status]}
              onOpenOutfit={setEditing}
            />
          ))}
        </div>
      )}

      {/* Editor */}
      <OutfitDetailModal
        open={editing !== null}
        outfit={editing}
        onClose={() => setEditing(null)}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

export default BoardTab;
