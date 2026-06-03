import { useState } from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAlerts } from '@/features/live-alerts/AlertsProvider';
import ManualFlow from '@/features/fashion-audit/ManualFlow';
import LiveAlertsView from '@/features/live-alerts/LiveAlertsView';

type Tab = 'generate' | 'alerts';

/**
 * FA Blog Automation has two entry paths into the same downstream
 * editor + publish flow:
 *
 *   1. "Generate"    — manual brainstorm: pick a title, draft, edit, publish
 *   2. "Live Alerts" — auto-flagged inbox: review n8n-prepared drafts, edit, publish
 *
 * Both flows are mounted at once and toggled with CSS so switching tabs
 * never loses mid-flow work (titles already generated, an edit in progress,
 * an alert being reviewed). The polling that feeds the Alerts badge lives
 * in AlertsProvider at the app root, so it runs regardless of which tab
 * is active.
 */
export default function FashionAuditView() {
  const { unreadCount } = useAlerts();
  // Default to the alerts tab when something is waiting for attention.
  const [tab, setTab] = useState<Tab>(unreadCount > 0 ? 'alerts' : 'generate');

  return (
    <div className="mx-auto max-w-6xl">
      <TabStrip value={tab} onChange={setTab} unreadCount={unreadCount} />
      <div className={tab === 'generate' ? '' : 'hidden'}>
        <ManualFlow />
      </div>
      <div className={tab === 'alerts' ? '' : 'hidden'}>
        <LiveAlertsView />
      </div>
    </div>
  );
}

function TabStrip({
  value,
  onChange,
  unreadCount,
}: {
  value: Tab;
  onChange: (t: Tab) => void;
  unreadCount: number;
}) {
  return (
    <div
      role="tablist"
      aria-label="FA Blog Automation modes"
      className="mb-6 inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1"
    >
      <TabButton
        active={value === 'generate'}
        onClick={() => onChange('generate')}
        icon={<Sparkles className="h-4 w-4" />}
        label="Generate"
      />
      <TabButton
        active={value === 'alerts'}
        onClick={() => onChange('alerts')}
        icon={<Bell className="h-4 w-4" />}
        label="Live Alerts"
        badge={unreadCount}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
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
      {badge && badge > 0 ? (
        <span
          className="ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-mngmnt-coral px-1.5 text-[10px] font-bold leading-none text-mngmnt-paper"
          aria-label={`${badge} unread alerts`}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  );
}
