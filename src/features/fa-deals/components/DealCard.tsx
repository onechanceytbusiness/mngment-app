import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Send,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import type { Deal } from '@/lib/types';
import { StoreBadge } from '@/features/fa-deals/components/StoreBadge';
import { storeMetaFor } from '@/features/fa-deals/lib/storeMeta';
import { formatRupees } from '@/features/fa-deals/lib/formatCurrency';

export interface DealCardProps {
  deal: Deal;
  /** "Post to Telegram" action — only present for auto (Amazon) deals. */
  onPost?: (deal: Deal) => void;
  /** "Mark as posted" action — for manual deals after ExtraPe flow. */
  onMarkPosted?: (deal: Deal) => void;
  onCopyLink?: (deal: Deal) => void;
  onDelete?: (deal: Deal) => void;
  postingId?: number | null;
  deletingId?: number | null;
}

export function DealCard({
  deal,
  onPost,
  onMarkPosted,
  onCopyLink,
  onDelete,
  postingId,
  deletingId,
}: DealCardProps) {
  const meta = storeMetaFor(deal.store);
  const savings =
    deal.mrp !== null && deal.price !== null ? deal.mrp - deal.price : null;
  const isPosted = deal.status === 'posted';
  const isAuto = deal.link_status === 'auto';
  const linkHref = deal.affiliate_link || deal.raw_link || '#';

  const posting = postingId === deal.id;
  const deleting = deletingId === deal.id;
  const busy = posting || deleting;

  return (
    <Card
      className={cn(
        'flex flex-col gap-3 p-4 transition-shadow md:p-5',
        isPosted && 'opacity-80',
      )}
    >
      <div className="flex items-start gap-4">
        {/* Image or store-flavoured placeholder tile */}
        <div className="relative shrink-0">
          {deal.image_url ? (
            <img
              src={deal.image_url}
              alt={deal.product_name}
              className="h-20 w-20 rounded-lg object-cover ring-1 ring-stone-200"
              loading="lazy"
              onError={(e) => {
                // Fall back to placeholder if the image URL is dead.
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-lg text-2xl font-bold',
                meta.tile,
              )}
              aria-hidden
            >
              {meta.initial}
            </div>
          )}
          {deal.discount_pct !== null && deal.discount_pct > 0 ? (
            <span className="absolute -right-2 -top-2 inline-flex h-7 min-w-[28px] items-center justify-center rounded-full bg-mngmnt-ink px-1.5 text-[11px] font-bold tabular-nums text-mngmnt-paper ring-2 ring-white">
              -{deal.discount_pct}%
            </span>
          ) : null}
        </div>

        {/* Headline + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StoreBadge store={deal.store} />
            {isPosted ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-mngmnt-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-mngmnt-paper">
                <CheckCircle2 className="h-3 w-3" />
                Posted
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700 ring-1 ring-inset ring-brand-200">
                Found
              </span>
            )}
            <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium capitalize text-stone-600">
              {deal.category}
            </span>
          </div>

          {deal.glow_title ? (
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-700">
              {deal.glow_title}
            </p>
          ) : null}
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-stone-900 md:text-base">
            {deal.product_name}
          </h3>

          {/* Price line */}
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-base font-bold text-stone-900">
              {formatRupees(deal.price)}
            </span>
            {deal.mrp !== null && deal.mrp > 0 && deal.mrp !== deal.price ? (
              <span className="text-xs text-stone-400 line-through">
                {formatRupees(deal.mrp)}
              </span>
            ) : null}
            {savings !== null && savings > 0 ? (
              <span className="text-xs font-medium text-brand-700">
                save {formatRupees(savings)}
              </span>
            ) : null}
          </div>

          {deal.pitch ? (
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-stone-600">
              {deal.pitch}
            </p>
          ) : null}
        </div>
      </div>

      {/* Footer: link + actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
        <a
          href={linkHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-brand-700"
        >
          {isAuto ? 'Affiliate link' : 'Raw link'}
          <ExternalLink className="h-3 w-3" />
        </a>

        <div className="flex flex-wrap items-center gap-2">
          {onDelete ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => onDelete(deal)}
              loading={deleting}
              disabled={busy}
              aria-label="Delete deal"
              className="!px-2"
            >
              <span className="sr-only">Delete</span>
            </Button>
          ) : null}

          {!isPosted && !isAuto && onCopyLink ? (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Copy className="h-4 w-4" />}
              onClick={() => onCopyLink(deal)}
              disabled={busy}
            >
              Copy for ExtraPe
            </Button>
          ) : null}

          {!isPosted && !isAuto && onMarkPosted ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onMarkPosted(deal)}
              disabled={busy}
            >
              Mark posted
            </Button>
          ) : null}

          {!isPosted && isAuto && onPost ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Send className="h-4 w-4" />}
              onClick={() => onPost(deal)}
              loading={posting}
              disabled={busy}
            >
              Post to Telegram
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export default DealCard;
