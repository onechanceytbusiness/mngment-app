import { useEffect, useState } from 'react';
import { ExternalLink, Save, UserSquare2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import { cn } from '@/lib/cn';
import { getAvatarIdentity, saveAvatarIdentity } from '@/lib/api';
import type { AvatarIdentity } from '@/lib/types';

interface FormState {
  name: string;
  profile: string;
  hero_image_url: string;
  identity_folder_url: string;
  notes: string;
}

function buildInitial(row: AvatarIdentity | null): FormState {
  return {
    name: row?.name ?? '',
    profile: row?.profile ?? '',
    hero_image_url: row?.hero_image_url ?? '',
    identity_folder_url: row?.identity_folder_url ?? '',
    notes: row?.notes ?? '',
  };
}

function IdentitySkeleton() {
  return (
    <Card className="flex flex-col gap-5 p-5 md:p-6">
      <div>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-10 w-2/3" />
      </div>
      <div>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-40 w-full" />
      </div>
      <div>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-10 w-full" />
      </div>
    </Card>
  );
}

export function IdentityTab() {
  const toast = useToast();
  const [row, setRow] = useState<AvatarIdentity | null>(null);
  const [form, setForm] = useState<FormState>(buildInitial(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const next = await getAvatarIdentity();
        if (!mounted) return;
        setRow(next);
        setForm(buildInitial(next));
      } catch (err) {
        if (!mounted) return;
        toast.error(
          err instanceof Error ? err.message : 'Failed to load identity',
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value as FormState[K] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const next = await saveAvatarIdentity({
        id: row?.id,
        name: form.name.trim() || null,
        profile: form.profile.trim() || null,
        hero_image_url: form.hero_image_url.trim() || null,
        identity_folder_url: form.identity_folder_url.trim() || null,
        notes: form.notes.trim() || null,
      });
      setRow(next);
      setForm(buildInitial(next));
      toast.success('Identity saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <IdentitySkeleton />;

  return (
    <Card className="flex flex-col gap-5 p-5 md:p-6">
      <div className="mb-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
          Studio · Identity
        </p>
        <h2 className="mt-1 text-lg font-bold text-stone-900 md:text-xl">
          Avatar identity
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-stone-500 md:text-sm">
          The master identity block your automation reads when generating
          new looks. Saves to <code className="text-[11px]">avatar_identity</code>.
        </p>
      </div>

      <Field label="Name">
        <input
          type="text"
          value={form.name}
          onChange={update('name')}
          disabled={saving}
          placeholder="Aahaan"
          className={inputClass}
        />
      </Field>

      <Field
        label="Profile"
        hint="The master identity block — written persona, look guidelines, do/don't rules. Automation pastes this into prompts."
      >
        <textarea
          rows={10}
          value={form.profile}
          onChange={update('profile')}
          disabled={saving}
          className={cn(textareaClass, 'leading-relaxed')}
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Hero image URL">
          <input
            type="url"
            value={form.hero_image_url}
            onChange={update('hero_image_url')}
            disabled={saving}
            placeholder="https://…"
            className={inputClass}
          />
        </Field>
        <Field
          label="Identity folder URL"
          hint="Drive/Notion/similar — the source-of-truth folder."
        >
          <div className="relative">
            <input
              type="url"
              value={form.identity_folder_url}
              onChange={update('identity_folder_url')}
              disabled={saving}
              placeholder="https://drive.google.com/…"
              className={cn(inputClass, 'pr-9')}
            />
            {form.identity_folder_url ? (
              <a
                href={form.identity_folder_url}
                target="_blank"
                rel="noreferrer"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-brand-700"
                aria-label="Open folder"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          rows={3}
          value={form.notes}
          onChange={update('notes')}
          disabled={saving}
          className={textareaClass}
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-4">
        <p className="text-[11px] text-stone-400">
          <UserSquare2 className="-mt-0.5 mr-1 inline-block h-3 w-3" />
          {row
            ? `Last saved ${new Date(row.updated_at).toLocaleString()}`
            : 'First save will create the row.'}
        </p>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Save className="h-4 w-4" />}
          loading={saving}
          disabled={saving}
          onClick={handleSave}
        >
          Save identity
        </Button>
      </div>
    </Card>
  );
}

const inputClass =
  'h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-60';

const textareaClass =
  'w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-60';

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

export default IdentityTab;
