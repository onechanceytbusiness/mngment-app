import { AlertTriangle, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Deal } from '@/lib/types';
import { formatRupees } from '@/features/fa-deals/lib/formatCurrency';

export interface ConfirmPostModalProps {
  open: boolean;
  deal: Deal | null;
  posting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const CHANNEL: Record<string, string> = {
  men: '@onechanceTG',
  women: '@priyapandeyTG',
};

export function ConfirmPostModal({
  open,
  deal,
  posting,
  onCancel,
  onConfirm,
}: ConfirmPostModalProps) {
  if (!deal) return null;
  const channel = CHANNEL[deal.audience] ?? '';

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!posting) onCancel();
      }}
      title="Post to Telegram?"
      size="lg"
      hideCloseButton={posting}
    >
      <div className="flex items-start gap-3 rounded-lg bg-brand-50 p-3 ring-1 ring-inset ring-brand-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
        <p className="text-xs leading-relaxed text-brand-800">
          This will publish to the <strong>{channel}</strong> public channel
          immediately. There is no undo from inside this app.
        </p>
      </div>

      <div className="mt-4 flex gap-3 rounded-lg border border-stone-200 p-3">
        {deal.image_url ? (
          <img
            src={deal.image_url}
            alt=""
            className="h-16 w-16 shrink-0 rounded-md object-cover ring-1 ring-stone-200"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-stone-100 text-lg font-bold text-stone-500">
            {(deal.store ?? '·').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          {deal.glow_title ? (
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-700">
              {deal.glow_title}
            </p>
          ) : null}
          <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-stone-900">
            {deal.product_name}
          </p>
          <p className="mt-1 text-xs text-stone-600">
            <span className="font-bold text-stone-900">
              {formatRupees(deal.price)}
            </span>
            {deal.mrp !== null && deal.mrp > 0 && deal.mrp !== deal.price ? (
              <>
                {' '}
                <span className="text-stone-400 line-through">
                  {formatRupees(deal.mrp)}
                </span>
              </>
            ) : null}
            {deal.discount_pct ? (
              <>
                {' · '}
                <span className="font-medium text-brand-700">
                  -{deal.discount_pct}% off
                </span>
              </>
            ) : null}
          </p>
          {deal.pitch ? (
            <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-stone-600">
              {deal.pitch}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="secondary"
          size="md"
          onClick={onCancel}
          disabled={posting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Send className="h-4 w-4" />}
          loading={posting}
          disabled={posting}
          onClick={onConfirm}
        >
          Post to {channel}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmPostModal;
