import { NavLink } from 'react-router-dom';
import { Bell, Newspaper, Sparkles, type LucideIcon } from 'lucide-react';
import { automations } from '@/config/automations';
import { useAlerts } from '@/features/live-alerts/AlertsProvider';
import { cn } from '@/lib/cn';

const ICONS: Record<string, LucideIcon> = {
  Newspaper,
  Sparkles,
  Bell,
};

function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src="/brand/mngmnt-burst-icon.svg"
      alt="mngmnt"
      width={40}
      height={40}
      className={cn('h-10 w-10 shrink-0 rounded-xl', className)}
    />
  );
}

export function Sidebar() {
  const { unreadCount } = useAlerts();
  return (
    <aside className="flex h-full w-16 shrink-0 flex-col border-r border-stone-200 bg-white md:w-72">
      <div className="flex h-20 items-center gap-3 border-b border-stone-200 px-3 md:px-6">
        <BrandLogo />
        <div className="hidden min-w-0 md:block">
          <div className="truncate text-base font-bold text-stone-900">
            mngmnt
          </div>
          <div className="truncate text-xs text-stone-500">Internal</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5 md:px-4">
        <div className="mb-3 hidden px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400 md:block">
          Automations
        </div>

        <nav className="space-y-2">
          {automations.map((a) => {
            const Icon = ICONS[a.icon] ?? Sparkles;
            const disabled = a.status === 'coming-soon';
            const unread = a.id === 'fashion-audit' ? unreadCount : 0;
            return (
              <NavLink
                key={a.id}
                to={`/automations/${a.id}`}
                title={a.name}
                aria-disabled={disabled}
                onClick={(e) => {
                  if (disabled) e.preventDefault();
                }}
                className={({ isActive }) =>
                  cn(
                    'group block rounded-xl border p-3 transition-colors',
                    isActive
                      ? 'border-brand-200 bg-brand-50'
                      : 'border-transparent hover:bg-stone-50',
                    disabled && 'cursor-not-allowed opacity-60',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                          isActive
                            ? 'bg-white text-brand-600 shadow-soft'
                            : 'bg-stone-100 text-stone-600',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {unread > 0 ? (
                          <span
                            className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-mngmnt-coral px-1 text-[10px] font-bold leading-none text-mngmnt-paper ring-2 ring-white"
                            aria-label={`${unread} unread alerts`}
                          >
                            {unread > 9 ? '9+' : unread}
                          </span>
                        ) : null}
                      </div>
                      <div className="hidden min-w-0 flex-1 md:block">
                        <div className="text-sm font-semibold leading-snug text-stone-900 line-clamp-2">
                          {a.name}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'hidden shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide md:inline-block',
                          a.status === 'active'
                            ? 'bg-mngmnt-coral text-mngmnt-paper'
                            : 'bg-stone-200 text-stone-600',
                        )}
                      >
                        {a.status === 'active' ? 'Active' : 'Soon'}
                      </span>
                    </div>
                    {a.description ? (
                      <p className="mt-2 hidden text-xs leading-snug text-stone-500 md:line-clamp-2">
                        {a.description}
                      </p>
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}

          <div className="hidden rounded-xl border border-dashed border-stone-300 p-3 md:block">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 text-sm font-semibold text-stone-700">
                More automations
              </div>
            </div>
            <p className="mt-2 text-xs leading-snug text-stone-500">
              New workflows will appear here as they're added to the hub.
            </p>
          </div>
        </nav>
      </div>

      <div className="hidden border-t border-stone-200 px-5 py-3 text-[11px] text-stone-400 md:block">
        v0.1 · internal
      </div>
    </aside>
  );
}

export default Sidebar;
