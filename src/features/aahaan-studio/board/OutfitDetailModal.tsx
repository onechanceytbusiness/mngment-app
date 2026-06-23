import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { ChevronDown, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastProvider';
import { cn } from '@/lib/cn';
import { deleteOutfit, updateOutfit } from '@/lib/api';
import type { DailyOutfit, OutfitStatus } from '@/lib/types';
import { OUTFIT_STATUSES } from '@/lib/types';
import { metaForStatus } from '@/features/aahaan-studio/lib/status';

export interface OutfitDetailModalProps {
  open: boolean;
  outfit: DailyOutfit | null;
  onClose: () => void;
  onSaved: (outfit: DailyOutfit) => void;
  onDeleted: (id: string) => void;
}

interface FormState {
  status: OutfitStatus;
  title: string;
  thoughts: string;
  top: string;
  bottom: string;
  footwear: string;
  accessories: string;
  background: string;
  caption: string;
  hashtags: string;
}

function buildInitial(outfit: DailyOutfit | null): FormState {
  if (!outfit) {
    return {
      status: 'idea',
      title: '',
      thoughts: '',
      top: '',
      bottom: '',
      footwear: '',
      accessories: '',
      background: '',
      caption: '',
      hashtags: '',
    };
  }
  return {
    status: outfit.status,
    title: outfit.title ?? '',
    thoughts: outfit.thoughts ?? '',
    top: outfit.top ?? '',
    bottom: outfit.bottom ?? '',
    footwear: outfit.footwear ?? '',
    accessories: outfit.accessories ?? '',
    background: outfit.background ?? '',
    caption: outfit.caption ?? '',
    hashtags: outfit.hashtags ?? '',
  };
}

export function OutfitDetailModal({
  open,
  outfit,
  onClose,
  onSaved,
  onDeleted,
}: OutfitDetailModalProps) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() => buildInitial(outfit));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // When the modal opens for a different outfit, reset everything.
  useEffect(() => {
    if (open) {
      setForm(buildInitial(outfit));
      setEditOpen(false);
    }
  }, [open, outfit]);

  if (!outfit) return null;

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value as FormState[K] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      // product_links and product_images are intentionally NOT included
      // in the patch — the image feature was removed to cut Supabase
      // Disk-IO usage, and we don't want to overwrite any existing data
      // that automation may have written there.
      const next = await updateOutfit(outfit.id, {
        title: form.title.trim() || null,
        thoughts: form.thoughts.trim() || null,
        top: form.top.trim() || null,
        bottom: form.bottom.trim() || null,
        footwear: form.footwear.trim() || null,
        accessories: form.accessories.trim() || null,
        background: form.background.trim() || null,
        caption: form.caption.trim() || null,
        hashtags: form.hashtags.trim() || null,
        status: form.status,
      });
      toast.success('Outfit saved.');
      onSaved(next);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this outfit? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteOutfit(outfit.id);
      toast.success('Outfit deleted.');
      onDeleted(outfit.id);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const meta = metaForStatus(form.status);
  const busy = saving || deleting;

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!busy) onClose();
      }}
      title={
        <span className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', meta.dot)} aria-hidden />
          <span className="lowercase">{meta.label}</span>
          <span className="text-stone-300">·</span>
          <span className="truncate">
            {outfit.title || `Outfit ${outfit.outfit_no ?? ''}`}
          </span>
        </span>
      }
      size="xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={handleDelete}
            loading={deleting}
            disabled={busy}
          >
            Delete
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save className="h-4 w-4" />}
              onClick={handleSave}
              loading={saving}
              disabled={busy}
            >
              Save
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* ── Read-only AI-generated look summary ───────────── */}
        <OutfitSummary form={form} outfit={outfit} />

        {/* ── Status (always visible) ───────────────────────── */}
        <Field label="Status">
          <select
            value={form.status}
            onChange={update('status')}
            disabled={busy}
            className={cn(inputClass, 'lowercase')}
          >
            {OUTFIT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        {/* ── Collapsed: Edit details ───────────────────────── */}
        <div className="rounded-lg border border-stone-200 bg-white">
          <button
            type="button"
            onClick={() => setEditOpen((o) => !o)}
            aria-expanded={editOpen}
            className="flex w-full items-center justify-between gap-2 rounded-lg px-4 py-3 text-left text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
          >
            <span>Edit details</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-stone-400 transition-transform',
                editOpen && 'rotate-180',
              )}
              aria-hidden
            />
          </button>
          {editOpen ? (
            <div className="flex flex-col gap-3 border-t border-stone-200 p-4">
              <Field label="Title">
                <input
                  type="text"
                  value={form.title}
                  onChange={update('title')}
                  disabled={busy}
                  className={inputClass}
                />
              </Field>

              <Field label="Thoughts">
                <textarea
                  rows={3}
                  value={form.thoughts}
                  onChange={update('thoughts')}
                  disabled={busy}
                  className={textareaClass}
                />
              </Field>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Top">
                  <input
                    type="text"
                    value={form.top}
                    onChange={update('top')}
                    disabled={busy}
                    className={inputClass}
                  />
                </Field>
                <Field label="Bottom">
                  <input
                    type="text"
                    value={form.bottom}
                    onChange={update('bottom')}
                    disabled={busy}
                    className={inputClass}
                  />
                </Field>
                <Field label="Footwear">
                  <input
                    type="text"
                    value={form.footwear}
                    onChange={update('footwear')}
                    disabled={busy}
                    className={inputClass}
                  />
                </Field>
                <Field label="Accessories">
                  <input
                    type="text"
                    value={form.accessories}
                    onChange={update('accessories')}
                    disabled={busy}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Background">
                <input
                  type="text"
                  value={form.background}
                  onChange={update('background')}
                  disabled={busy}
                  className={inputClass}
                />
              </Field>

              <Field label="Caption">
                <textarea
                  rows={3}
                  value={form.caption}
                  onChange={update('caption')}
                  disabled={busy}
                  className={textareaClass}
                />
              </Field>

              <Field label="Hashtags">
                <textarea
                  rows={2}
                  value={form.hashtags}
                  onChange={update('hashtags')}
                  disabled={busy}
                  placeholder="#fashion #aahaan #ootd"
                  className={textareaClass}
                />
              </Field>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

// ───────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────

/**
 * Compact read-only summary at the top of the modal. Reflects the
 * CURRENT form state (so editing in "Edit details" updates the
 * preview live), and falls back gracefully when fields are blank.
 */
function OutfitSummary({
  form,
  outfit,
}: {
  form: FormState;
  outfit: DailyOutfit;
}) {
  const items = [
    { label: 'Top', value: form.top },
    { label: 'Bottom', value: form.bottom },
    { label: 'Footwear', value: form.footwear },
    { label: 'Accessories', value: form.accessories },
    { label: 'Background', value: form.background },
  ].filter((item) => item.value && item.value.trim().length > 0);

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400">
          AI-generated look
        </p>
        <p className="text-[11px] text-stone-400">
          {outfit.outfit_date ?? ''}
          {outfit.outfit_date && outfit.outfit_no !== null ? ' · ' : ''}
          {outfit.outfit_no !== null ? `#${outfit.outfit_no}` : ''}
        </p>
      </div>

      <h3
        className={cn(
          'mt-1.5 text-base font-semibold leading-snug',
          form.title ? 'text-stone-900' : 'italic text-stone-400',
        )}
      >
        {form.title || 'Untitled look'}
      </h3>

      {items.length > 0 ? (
        <dl className="mt-3 grid grid-cols-[88px_1fr] gap-x-4 gap-y-1.5 text-xs">
          {items.map((item) => (
            <div key={item.label} className="contents">
              <dt className="font-semibold uppercase tracking-wide text-stone-400">
                {item.label}
              </dt>
              <dd className="text-stone-700">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-2 text-xs italic text-stone-400">
          No items captured yet. Use Edit details to fill them in.
        </p>
      )}
    </div>
  );
}

const inputClass =
  'h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-60';

const textareaClass =
  'w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm leading-relaxed text-stone-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-60';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-stone-700">{label}</span>
      {children}
      {hint ? <span className="text-[11px] text-stone-400">{hint}</span> : null}
    </label>
  );
}

export default OutfitDetailModal;
