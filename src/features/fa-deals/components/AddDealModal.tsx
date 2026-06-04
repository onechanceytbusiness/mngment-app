import { useState, type FormEvent } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastProvider';
import { enrichDeal, insertDeal } from '@/lib/api';
import type { Audience, Deal, EnrichDealInput } from '@/lib/types';

export interface AddDealModalProps {
  open: boolean;
  defaultAudience: Audience;
  onClose: () => void;
  onCreated: (deal: Deal) => void;
}

interface FormState {
  audience: Audience;
  name: string;
  store: string;
  mrp: string; // string while editing, parsed on submit
  price: string;
  link: string;
  image: string;
}

const initialForm = (defaultAudience: Audience): FormState => ({
  audience: defaultAudience,
  name: '',
  store: '',
  mrp: '',
  price: '',
  link: '',
  image: '',
});

export function AddDealModal({
  open,
  defaultAudience,
  onClose,
  onCreated,
}: AddDealModalProps) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(initialForm(defaultAudience));
  const [submitting, setSubmitting] = useState(false);

  // Reset form when the modal opens for a different default audience.
  // We use a key prop strategy on the form below to make this implicit;
  // when the parent toggles open false → true and defaultAudience changes,
  // the form re-mounts. For an explicit reset on every close, also clear
  // here:
  const resetForm = () => setForm(initialForm(defaultAudience));

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value as FormState[K] }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const mrp = Number(form.mrp);
    const price = Number(form.price);
    if (!form.name.trim()) {
      toast.error('Product name is required.');
      return;
    }
    if (!form.link.trim()) {
      toast.error('Product link is required.');
      return;
    }
    if (Number.isNaN(price) || price <= 0) {
      toast.error('Enter a valid price.');
      return;
    }
    if (Number.isNaN(mrp) || mrp < price) {
      toast.error('MRP must be greater than or equal to price.');
      return;
    }

    const input: EnrichDealInput = {
      name: form.name.trim(),
      store: form.store.trim(),
      mrp,
      price,
      link: form.link.trim(),
      image: form.image.trim() || undefined,
      audienceHint: form.audience,
    };

    setSubmitting(true);
    try {
      const enriched = await enrichDeal(input);
      const persisted = await insertDeal(enriched);
      toast.success(
        enriched.link_status === 'auto'
          ? 'Enriched. Affiliate link ready — review and post.'
          : 'Enriched. Convert in ExtraPe before posting.',
      );
      onCreated(persisted);
      resetForm();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to add deal',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!submitting) {
          resetForm();
          onClose();
        }
      }}
      title="Add a deal"
      description="We'll enrich it (apply affiliate tag if it's an Amazon link) and draft post-ready copy."
      size="lg"
    >
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label="Audience">
          <select
            value={form.audience}
            onChange={update('audience')}
            disabled={submitting}
            className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
          >
            <option value="men">Men (@onechanceTG)</option>
            <option value="women">Women (@priyapandeyTG)</option>
          </select>
        </Field>

        <Field label="Product name" required>
          <input
            type="text"
            required
            value={form.name}
            onChange={update('name')}
            placeholder="boAt Airdopes 161"
            disabled={submitting}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Store" hint="Amazon / Flipkart / Myntra / …">
            <input
              type="text"
              value={form.store}
              onChange={update('store')}
              placeholder="Amazon"
              disabled={submitting}
              className={inputClass}
            />
          </Field>
          <Field label="MRP (₹)" required>
            <input
              type="number"
              required
              min={0}
              value={form.mrp}
              onChange={update('mrp')}
              placeholder="2999"
              disabled={submitting}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Price (₹)" required>
          <input
            type="number"
            required
            min={0}
            value={form.price}
            onChange={update('price')}
            placeholder="1099"
            disabled={submitting}
            className={inputClass}
          />
        </Field>

        <Field label="Product link" required>
          <input
            type="url"
            required
            value={form.link}
            onChange={update('link')}
            placeholder="https://www.amazon.in/..."
            disabled={submitting}
            className={inputClass}
          />
        </Field>

        <Field label="Image URL" hint="Optional — falls back to a store placeholder.">
          <input
            type="url"
            value={form.image}
            onChange={update('image')}
            placeholder="https://m.media-amazon.com/..."
            disabled={submitting}
            className={inputClass}
          />
        </Field>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={submitting}
          disabled={submitting}
          leftIcon={<Sparkles className="h-4 w-4" />}
          className="mt-2 w-full"
        >
          Enrich &amp; save
        </Button>
      </form>
    </Modal>
  );
}

const inputClass =
  'h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-60';

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-stone-700">
        {label}
        {required ? <span className="ml-0.5 text-brand-600">*</span> : null}
      </span>
      {children}
      {hint ? <span className="text-[11px] text-stone-400">{hint}</span> : null}
    </label>
  );
}

export default AddDealModal;
