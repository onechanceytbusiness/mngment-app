import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
}

interface ToastProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

// Strict mngment palette: coral for success (the celebratory brand accent),
// ink for info (quiet, on-brand), rose kept for error so destructive states
// stay visually distinct from the brand accent.
const KIND_STYLES: Record<ToastKind, { bar: string; icon: string }> = {
  success: { bar: 'bg-brand-500', icon: 'text-brand-500' },
  error: { bar: 'bg-rose-500', icon: 'text-rose-500' },
  info: { bar: 'bg-mngment-ink', icon: 'text-mngment-ink' },
};

export function Toast({ toast, onClose }: ToastProps) {
  const styles = KIND_STYLES[toast.kind];
  const Icon =
    toast.kind === 'success'
      ? CheckCircle2
      : toast.kind === 'error'
        ? AlertTriangle
        : Info;

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex w-80 items-start gap-3 overflow-hidden rounded-lg border border-stone-200 bg-white p-3 pr-2 shadow-card',
        'animate-in fade-in slide-in-from-top-2',
      )}
    >
      <div className={cn('mt-0.5 h-4 w-1 shrink-0 rounded-sm', styles.bar)} />
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', styles.icon)} />
      <p className="flex-1 text-sm leading-snug text-stone-800">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="rounded p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default Toast;
