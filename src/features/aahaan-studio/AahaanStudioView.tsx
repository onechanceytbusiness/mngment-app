import { useState } from 'react';
import { LayoutGrid, UserSquare2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import BoardTab from '@/features/aahaan-studio/board/BoardTab';
import IdentityTab from '@/features/aahaan-studio/identity/IdentityTab';

type Tab = 'board' | 'identity';

/**
 * Aahaan Studio shares the hub's auth/Supabase client and renders as a
 * single automation card. Two tabs inside — Board (kanban over
 * daily_outfits) and Identity (single avatar_identity row).
 *
 * Both tabs stay mounted (display:none on the inactive one) so switching
 * back and forth preserves work-in-progress in the modal / form fields,
 * matching the FashionAuditView pattern.
 */
export default function AahaanStudioView() {
  const [tab, setTab] = useState<Tab>('board');

  return (
    <div className="mx-auto max-w-6xl py-6 md:py-8">
      <TabStrip value={tab} onChange={setTab} />
      <div className={tab === 'board' ? '' : 'hidden'}>
        <BoardTab />
      </div>
      <div className={tab === 'identity' ? '' : 'hidden'}>
        <IdentityTab />
      </div>
    </div>
  );
}

function TabStrip({
  value,
  onChange,
}: {
  value: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Aahaan Studio sections"
      className="mb-6 inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1"
    >
      <TabButton
        active={value === 'board'}
        onClick={() => onChange('board')}
        icon={<LayoutGrid className="h-4 w-4" />}
        label="Board"
      />
      <TabButton
        active={value === 'identity'}
        onClick={() => onChange('identity')}
        icon={<UserSquare2 className="h-4 w-4" />}
        label="Identity"
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors',
        active
          ? 'bg-white text-stone-900 shadow-soft'
          : 'text-stone-500 hover:text-stone-700',
      )}
    >
      <span
        className={cn(
          'flex h-4 w-4 items-center justify-center',
          active ? 'text-brand-600' : 'text-stone-400',
        )}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}
