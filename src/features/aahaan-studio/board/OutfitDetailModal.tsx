import { useEffect, useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastProvider';
import { cn } from '@/lib/cn';
import { deleteOutfit, updateOutfit } from '@/lib/api';
import type { DailyOutfit, OutfitStatus, ProductLink } from '@/lib/types';
import { OUTFIT_STATUSES } from '@/lib/types';
import { STATUS_META } from '@/features/aahaan-studio/lib/status';
import {
  parseProductImages,
  parseProductLinks,
  stringifyProductImages,
  stringifyProductLinks,
} from '@/features/aahaan-studio/lib/parseProductLinks';

export interface OutfitDetailModalProps {
  open: boolean;
  outfit: DailyOutfit | null;
  onClose: () => void;
  onSaved: (outfit: DailyOutfit) => void;
  onDeleted: (id: string) => void;
}

interface FormState {
  title: string;
  thoughts: string;
  top: string;
  bottom: string;
  footwear: string;
  accessories: string;
  background: string;
  caption: string;
  hashtags: string;
  product_links_text: string;
  product_images_text: string;
  status: OutfitStatus;
}

function buildInitial(outfit: DailyOutfit | null): FormState {
  if (!outfit) {
    return {
      title: '',
      thoughts: '',
      top: '',
      bottom: '',
      footwear: '',
      accessories: '',
      background: '',
      caption: '',
      hashtags: '',
      product_links_text: '',
      product_images_text: '',
      status: 'idea',
    };
  }
  return {
    title: outfit.title ?? '',
    thoughts: outfit.thoughts ?? '',
    top: outfit.top ?? '',
    bottom: outfit.bottom ?? '',
    footwear: outfit.footwear ?? '',
    accessories: outfit.accessories ?? '',
    background: outfit.background ?? '',
    caption: outfit.caption ?? '',
    hashtags: outfit.hashtags ?? '',
    product_links_text: stringifyProductLinks(outfit.product_links),
    product_images_text: stringifyProductImages(outfit.product_images),
    status: outfit.status,
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

  // When the modal opens for a different outfit, reset the form.
  useEffect(() => {
    if (open) {
      setForm(buildInitial(outfit));
    }
  }, [open, outfit]);

  if (!outfit) return null;

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value as FormState[K] }));

  // Live thumbnails preview parsed from the images textarea.
  const parsedImages = parseProductImages(form.product_images_text);

  const handleSave = async () => {
    setSaving(true);
    const productLinks: ProductLink[] = parseProductLinks(form.product_links_text);
    const productImages = parsedImages;
    try {
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
        product_links: productLinks,
        product_images: productImages,
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

  const meta = STATUS_META[form.status];
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
      description={`Edit any field. Changing status moves the card to that column.`}
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
      <div className="flex flex-col gap-4">
        {/* Top row: title + status */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
          <Field label="Title">
            <input
              type="text"
              value={form.title}
              onChange={update('title')}
              disabled={busy}
              className={inputClass}
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={update('status')}
              disabled={busy}
              className={cn(inputClass, 'pr-7 lowercase')}
            >
              {OUTFIT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Meta hint */}
        <p className="text-[11px] text-stone-400">
          {outfit.outfit_date ? <>📅 {outfit.outfit_date}</> : null}
          {outfit.outfit_date && outfit.outfit_no !== null ? ' · ' : null}
          {outfit.outfit_no !== null ? <>#{outfit.outfit_no}</> : null}
        </p>

        {/* Thoughts */}
        <Field label="Thoughts">
          <textarea
            rows={3}
            value={form.thoughts}
            onChange={update('thoughts')}
            disabled={busy}
            className={textareaClass}
          />
        </Field>

        {/* Garments grid */}
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

        {/* Product links */}
        <Field
          label="Product links"
          hint='One per line as "Label | https://…"'
        >
          <textarea
            rows={4}
            value={form.product_links_text}
            onChange={update('product_links_text')}
            disabled={busy}
            placeholder={'Anita Dongre kurta | https://anitadongre.com/...\nClog | https://example.com/...'}
            className={cn(textareaClass, 'font-mono text-xs')}
          />
        </Field>

        {/* Product images */}
        <Field label="Product images" hint="One URL per line.">
          <textarea
            rows={3}
            value={form.product_images_text}
            onChange={update('product_images_text')}
            disabled={busy}
            placeholder={'https://...\nhttps://...'}
            className={cn(textareaClass, 'font-mono text-xs')}
          />
          {parsedImages.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {parsedImages.map((url, i) => (
                <img
                  key={`${url}-${i}`}
                  src={url}
                  alt=""
                  className="h-14 w-14 rounded-md object-cover ring-1 ring-stone-200"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ))}
            </div>
          ) : null}
        </Field>

        {/* Caption + hashtags */}
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
    </Modal>
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
  children: React.ReactNode;
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
