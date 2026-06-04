import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import { cn } from '@/lib/cn';
import {
  deleteDeal as apiDeleteDeal,
  listDeals,
  postDealToTelegram,
  updateDeal,
} from '@/lib/api';
import type { Audience, Deal } from '@/lib/types';
import { useDeals } from '@/features/fa-deals/DealsProvider';
import { AddDealModal } from '@/features/fa-deals/components/AddDealModal';
import {
  CategoryFilter,
  type CategoryFilterValue,
} from '@/features/fa-deals/components/CategoryFilter';
import { ConfirmPostModal } from '@/features/fa-deals/components/ConfirmPostModal';
import { DealCard } from '@/features/fa-deals/components/DealCard';

const AUDIENCES: { value: Audience; label: string; emoji: string }[] = [
  { value: 'men', label: 'Men', emoji: '🧔' },
  { value: 'women', label: 'Women', emoji: '👩' },
];

function AudienceTabs({
  value,
  onChange,
}: {
  value: Audience;
  onChange: (v: Audience) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Audience"
      className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1"
    >
      {AUDIENCES.map((a) => {
        const active = value === a.value;
        return (
          <button
            key={a.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(a.value)}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
              active
                ? 'bg-white text-stone-900 shadow-soft'
                : 'text-stone-500 hover:text-stone-700',
            )}
          >
            <span aria-hidden>{a.emoji}</span>
            {a.label}
          </button>
        );
      })}
    </div>
  );
}

function DealsListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-4 md:p-5">
          <div className="flex items-start gap-4">
            <Skeleton className="h-20 w-20 rounded-lg" />
            <div className="min-w-0 flex-1">
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
              <Skeleton className="mt-2 h-3 w-1/2" />
              <Skeleton className="mt-2 h-5 w-4/5" />
              <Skeleton className="mt-2 h-4 w-1/3" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-2/3" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function FaDealsView() {
  const toast = useToast();
  const { refresh: refreshBadge } = useDeals();
  const [audience, setAudience] = useState<Audience>('men');
  const [filter, setFilter] = useState<CategoryFilterValue>('all');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [pendingPost, setPendingPost] = useState<Deal | null>(null);
  const [postingId, setPostingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadDeals = useCallback(
    async (target: Audience) => {
      setLoading(true);
      try {
        const rows = await listDeals(target);
        setDeals(rows);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to load deals',
        );
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void loadDeals(audience);
  }, [audience, loadDeals]);

  // Local computed lists so swapping the filter doesn't re-fetch.
  const visible = useMemo(() => {
    if (filter === 'all') return deals;
    return deals.filter((d) => d.category === filter);
  }, [deals, filter]);

  const categoryCounts = useMemo(() => {
    const out: Partial<Record<CategoryFilterValue, number>> = {
      all: deals.length,
    };
    for (const d of deals) {
      const key = d.category as CategoryFilterValue;
      out[key] = (out[key] ?? 0) + 1;
    }
    return out;
  }, [deals]);

  const handleCreated = (deal: Deal) => {
    // Optimistic prepend; will be in the next listDeals fetch anyway.
    setDeals((prev) => [deal, ...prev]);
    void refreshBadge();
  };

  const handleDelete = async (deal: Deal) => {
    setDeletingId(deal.id);
    try {
      await apiDeleteDeal(deal.id);
      setDeals((prev) => prev.filter((d) => d.id !== deal.id));
      void refreshBadge();
      toast.success('Deal deleted.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyLink = async (deal: Deal) => {
    const link = deal.raw_link ?? deal.affiliate_link ?? '';
    if (!link) {
      toast.error('No link to copy.');
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      toast.success(
        'Link copied. Paste into ExtraPe to generate the affiliate URL.',
      );
    } catch {
      toast.error('Clipboard unavailable — copy the link manually.');
    }
  };

  const handleMarkPosted = async (deal: Deal) => {
    try {
      const updated = await updateDeal(deal.id, {
        status: 'posted',
        posted_to: Array.from(new Set([...(deal.posted_to ?? []), 'extrape'])),
      });
      setDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      void refreshBadge();
      toast.success('Marked as posted.');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to mark as posted',
      );
    }
  };

  const requestPost = (deal: Deal) => {
    setPendingPost(deal);
  };

  const confirmPost = async () => {
    if (!pendingPost) return;
    const target = pendingPost;
    setPostingId(target.id);
    try {
      const result = await postDealToTelegram(target);
      if (!result.ok) {
        toast.error(result.message ?? 'Telegram post failed');
        return;
      }
      const updated = await updateDeal(target.id, {
        status: 'posted',
        posted_to: Array.from(new Set([...(target.posted_to ?? []), 'telegram'])),
      });
      setDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      void refreshBadge();
      setPendingPost(null);
      toast.success(
        result.channel
          ? `Posted to ${result.channel}.`
          : 'Posted to Telegram.',
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to post to Telegram',
      );
    } finally {
      setPostingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-6 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-stone-900 md:text-2xl">
            FA Deals Automation
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => loadDeals(audience)}
              loading={loading}
              leftIcon={<RefreshCw className="h-4 w-4" />}
              aria-label="Refresh deals"
              className="!px-2 sm:!px-3"
            >
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAddOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              <span className="hidden sm:inline">Add deal</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-stone-500 md:text-sm">
          Find, convert, and post product deals to your Telegram channels —
          review and publish.
        </p>
      </div>

      {/* Audience tabs */}
      <div className="mb-4">
        <AudienceTabs value={audience} onChange={setAudience} />
      </div>

      {/* Category filter */}
      <div className="mb-5">
        <CategoryFilter
          value={filter}
          onChange={setFilter}
          counts={categoryCounts}
        />
      </div>

      {/* List */}
      {loading && deals.length === 0 ? (
        <DealsListSkeleton />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Tag className="h-7 w-7" />}
          title="No deals here yet"
          description={
            filter === 'all'
              ? `Add a ${audience === 'women' ? "women's" : "men's"} deal to get started — paste a product link, MRP and price, and we'll enrich it.`
              : `Nothing in this category for ${audience}. Try another filter or add a deal.`
          }
          action={
            <Button
              variant="primary"
              size="md"
              onClick={() => setAddOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add deal
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              postingId={postingId}
              deletingId={deletingId}
              onPost={requestPost}
              onMarkPosted={handleMarkPosted}
              onCopyLink={handleCopyLink}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add modal */}
      <AddDealModal
        open={addOpen}
        defaultAudience={audience}
        onClose={() => setAddOpen(false)}
        onCreated={handleCreated}
      />

      {/* Confirm post modal */}
      <ConfirmPostModal
        open={pendingPost !== null}
        deal={pendingPost}
        posting={postingId !== null}
        onCancel={() => setPendingPost(null)}
        onConfirm={confirmPost}
      />
    </div>
  );
}
