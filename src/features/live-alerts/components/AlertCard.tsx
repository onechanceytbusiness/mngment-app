import { ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import type { Alert } from '@/lib/types';
import { PriorityChip } from '@/features/live-alerts/components/PriorityChip';
import { StatusPill } from '@/features/live-alerts/components/StatusPill';
import { timeAgo } from '@/features/live-alerts/lib/timeAgo';

export interface AlertCardProps {
  alert: Alert;
  dismissing?: boolean;
  onReview: (alert: Alert) => void;
  onDismiss: (alert: Alert) => void;
}

export function AlertCard({
  alert,
  dismissing,
  onReview,
  onDismiss,
}: AlertCardProps) {
  const isUnread = alert.status === 'new';

  return (
    <Card
      className={cn(
        'flex flex-col gap-4 p-5 transition-shadow',
        // Unread alerts get a coral left rail to draw the eye.
        isUnread && 'ring-2 ring-mngment-coral/40',
      )}
    >
      <div className="flex items-start gap-3">
        <PriorityChip score={alert.score} className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-snug text-stone-900">
            {alert.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            <span className="font-medium text-stone-500">Why it matters: </span>
            {alert.reason}
          </p>
        </div>
        <StatusPill status={alert.status} />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
        <span className="font-medium text-stone-700">{alert.source}</span>
        <span aria-hidden>·</span>
        <a
          href={alert.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-stone-500 hover:text-brand-600"
        >
          view source
          <ExternalLink className="h-3 w-3" />
        </a>
        <span aria-hidden>·</span>
        <span title={new Date(alert.createdAt).toLocaleString()}>
          {timeAgo(alert.createdAt)}
        </span>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<X className="h-4 w-4" />}
          onClick={() => onDismiss(alert)}
          disabled={dismissing}
        >
          Dismiss
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onReview(alert)}
          disabled={dismissing}
        >
          Review draft
        </Button>
      </div>
    </Card>
  );
}

export default AlertCard;
