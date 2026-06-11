import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Width preset. Default is 'md' (max-w-md). */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Hide the X close button (e.g. for must-confirm flows). */
  hideCloseButton?: boolean;
}

const SIZE_CLASS: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-4xl',
};

/**
 * Lightweight modal primitive. Sits on top of a translucent ink backdrop;
 * closes on Escape or backdrop click (unless hideCloseButton is true and
 * the caller wants force-confirm semantics — pass an explicit cancel
 * button in the footer instead).
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  hideCloseButton,
}: ModalProps) {
  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop (separate button for keyboard accessibility) */}
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div
        className={cn(
          // max-h caps the panel at viewport-minus-gutter so the
          // sticky header + footer never get pushed off-screen on
          // short windows. The body inside has flex-1 overflow-y-auto,
          // so internal scroll handles overflow cleanly. Uses dvh so
          // mobile browsers with retracting URL bars don't clip the
          // footer.
          'relative z-10 flex max-h-[calc(100dvh-2rem)] w-full flex-col rounded-t-2xl bg-white shadow-card sm:rounded-2xl',
          SIZE_CLASS[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-3 border-b border-stone-200 px-5 py-4">
            <div className="min-w-0 flex-1">
              {title ? (
                <h2
                  id="modal-title"
                  className="text-base font-semibold text-stone-900"
                >
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-1 text-xs leading-relaxed text-stone-500">
                  {description}
                </p>
              ) : null}
            </div>
            {!hideCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 rounded-md p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <div className="border-t border-stone-200 px-5 py-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

export default Modal;
