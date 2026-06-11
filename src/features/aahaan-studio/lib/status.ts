import type { OutfitStatus } from '@/lib/types';

/**
 * Per-status visual treatment for the kanban.
 *
 * The mngmnt palette is strict — ink / coral / paper + stone neutrals.
 * Instead of six hand-picked hues (slate/amber/purple/teal/green/gray
 * from the original Studio spec), we model the pipeline as a single
 * intensity ramp: cool stones → coral → ink. This keeps the studio
 * feeling native to the rest of the hub while still giving each column
 * a distinct visual identity at a glance.
 *
 *   idea       — stone-300 · just discovered
 *   sourced    — stone-500 · materials gathered
 *   generated  — brand-300 · warming up
 *   edited     — brand-500 · coral, the active phase
 *   ready      — brand-700 · deep coral, action moment
 *   posted     — ink       · done, archived
 */
export interface StatusMeta {
  label: string; // lowercase, e.g. "idea"
  /** Tailwind class for the small dot in the column header + on cards. */
  dot: string;
  /** Tailwind class for the left "spine" border colour on cards. */
  spine: string;
  /** Tailwind class for the status pill bg used inside the editor. */
  pill: string;
}

export const STATUS_META: Record<OutfitStatus, StatusMeta> = {
  idea: {
    label: 'idea',
    dot: 'bg-stone-300',
    spine: 'border-l-stone-300',
    pill: 'bg-stone-100 text-stone-700 ring-1 ring-inset ring-stone-200',
  },
  sourced: {
    label: 'sourced',
    dot: 'bg-stone-500',
    spine: 'border-l-stone-500',
    pill: 'bg-stone-200 text-stone-800 ring-1 ring-inset ring-stone-300',
  },
  generated: {
    label: 'generated',
    dot: 'bg-brand-300',
    spine: 'border-l-brand-300',
    pill: 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200',
  },
  edited: {
    label: 'edited',
    dot: 'bg-brand-500',
    spine: 'border-l-brand-500',
    pill: 'bg-brand-100 text-brand-800 ring-1 ring-inset ring-brand-300',
  },
  ready: {
    label: 'ready',
    dot: 'bg-brand-700',
    spine: 'border-l-brand-700',
    pill: 'bg-brand-200 text-brand-900 ring-1 ring-inset ring-brand-400',
  },
  posted: {
    label: 'posted',
    dot: 'bg-mngmnt-ink',
    spine: 'border-l-mngmnt-ink',
    pill: 'bg-mngmnt-ink text-mngmnt-paper',
  },
};

/**
 * Safe lookup — defaults to the 'idea' meta if the caller passes an
 * unknown / null / stale status value. Prevents the modal from
 * crashing silently when a DB row has a status outside the enum.
 */
export function metaForStatus(status: string | null | undefined): StatusMeta {
  if (status && status in STATUS_META) {
    return STATUS_META[status as OutfitStatus];
  }
  return STATUS_META.idea;
}

/** Friendly hint shown in an empty kanban column. */
export const EMPTY_HINT: Record<OutfitStatus, string> = {
  idea: 'New looks land here as they get drafted.',
  sourced: 'Materials confirmed — moodboard + product links ready.',
  generated: 'AI avatar shots produced. Awaiting review.',
  edited: 'Renders touched up. Almost ready to publish.',
  ready: 'Caption + hashtags locked. Schedule when you’re ready.',
  posted: 'Published archive — populated by automation later.',
};
