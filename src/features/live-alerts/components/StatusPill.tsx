import { cn } from '@/lib/cn';
import type { AlertStatus } from '@/lib/types';

const STATUS_LABEL: Record<AlertStatus, string> = {
  new: 'New',
  draft: 'Draft ready',
  published: 'Published',
};

const STATUS_STYLE: Record<AlertStatus, string> = {
  // Spotlight on unreviewed items — solid brand coral.
  new: 'bg-mngmnt-coral text-mngmnt-paper',
  // Acknowledged but not yet live — quiet coral tint with the brand
  // text colour, signalling "in progress".
  draft: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200',
  // Done — solid ink for a "shipped" feel that contrasts with the
  // active states above.
  published: 'bg-mngmnt-ink text-mngmnt-paper',
};

export function StatusPill({ status }: { status: AlertStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
        STATUS_STYLE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export default StatusPill;
