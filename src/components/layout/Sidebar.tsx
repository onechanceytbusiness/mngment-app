import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bell,
  Newspaper,
  Shirt,
  Sparkles,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import { automations } from '@/config/automations';
import { useAlerts } from '@/features/live-alerts/AlertsProvider';
import { useDeals } from '@/features/fa-deals/DealsProvider';
import { cn } from '@/lib/cn';

const ICONS: Record<string, LucideIcon> = {
  Newspaper,
  Sparkles,
  Bell,
  Tag,
  Shirt,
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

const MD_QUERY = '(min-width: 768px)';

/**
 * Tracks whether the viewport is at the md+ breakpoint. Used to decide
 * whether the sidebar should render in "icon rail with drawer toggle"
 * mode (mobile) or "always-expanded static" mode (md+).
 */
function useIsMd(): boolean {
  const [isMd, setIsMd] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(MD_QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(MD_QUERY);
    const handler = (e: MediaQueryListEvent) => setIsMd(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMd;
}

export function Sidebar() {
  const { unreadCount } = useAlerts();
  const { unpostedCount } = useDeals();
  const isMd = useIsMd();
  const [isOpen, setIsOpen] = useState(false);

  // "expanded" = show full labels/descriptions/pills. Always true on md+;
  // only true on mobile when the user has tapped the brand logo to open.
  const expanded = isMd || isOpen;

  const handleClose = () => setIsOpen(false);

  // ESC key closes the mobile drawer.
  useEffect(() => {
    if (!isOpen || isMd) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isMd]);

  // Reset open state when crossing the md threshold so the drawer doesn't
  // linger in a weird state after a viewport resize / orientation change.
  useEffect(() => {
    if (isMd) setIsOpen(false);
  }, [isMd]);

  return (
    <>
      {/*
        Backdrop. Only rendered when the mobile drawer is open. Clicking
        it (or pressing Enter/Space, since it's a real <button>) closes
        the drawer. Hidden on md+ regardless of state.
      */}
      {isOpen && !isMd ? (
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-stone-900/40 md:hidden"
        />
      ) : null}

      <aside
        className={cn(
          'flex h-full shrink-0 flex-col border-r border-stone-200 bg-white transition-[width,box-shadow] duration-200',
          // Mobile: icon rail by default, fixed overlay drawer when open
          isOpen
            ? 'fixed inset-y-0 left-0 z-40 w-72 shadow-card'
            : 'relative w-16',
          // md+: always static + full width
          'md:relative md:z-auto md:w-72 md:shadow-none',
        )}
      >
        {/*
          Brand header — also the toggle for the mobile drawer. On md+
          the toggle is a no-op (the sidebar is always expanded), so we
          suppress the hover affordance there for honesty.
        */}
        <button
          type="button"
          onClick={() => {
            if (!isMd) setIsOpen((o) => !o);
          }}
          aria-label={
            isMd ? 'mngmnt' : isOpen ? 'Collapse sidebar' : 'Expand sidebar'
          }
          aria-expanded={isMd ? undefined : isOpen}
          className="flex h-20 items-center gap-3 border-b border-stone-200 px-3 text-left transition-colors hover:bg-stone-50 md:cursor-default md:px-6 md:hover:bg-transparent"
        >
          <BrandLogo />
          {expanded ? (
            <div className="min-w-0">
              <div className="truncate text-base font-bold text-stone-900">
                mngmnt
              </div>
              <div className="truncate text-xs text-stone-500">Internal</div>
            </div>
          ) : null}
        </button>

        <div
          className={cn(
            'flex-1 overflow-y-auto py-4 md:py-5',
            expanded ? 'px-4' : 'px-2',
          )}
        >
          {expanded ? (
            <div className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">
              Automations
            </div>
          ) : null}

          <nav className="space-y-2">
            {automations.map((a) => {
              const Icon = ICONS[a.icon] ?? Sparkles;
              const disabled = a.status === 'coming-soon';
              const unread =
              a.id === 'fashion-audit'
                ? unreadCount
                : a.id === 'fa-deals'
                  ? unpostedCount
                  : 0;
              return (
                <NavLink
                  key={a.id}
                  to={`/automations/${a.id}`}
                  title={a.name}
                  aria-disabled={disabled}
                  onClick={(e) => {
                    if (disabled) {
                      e.preventDefault();
                      return;
                    }
                    // Auto-close the mobile drawer after navigation so the
                    // user lands directly in the workspace.
                    if (!isMd) handleClose();
                  }}
                  className={({ isActive }) =>
                    cn(
                      'group block rounded-xl border transition-colors',
                      expanded ? 'p-3' : 'p-2',
                      isActive
                        ? 'border-brand-200 bg-brand-50'
                        : 'border-transparent hover:bg-stone-50',
                      disabled && 'cursor-not-allowed opacity-60',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={cn(
                          'flex items-center gap-2.5',
                          expanded ? 'justify-start' : 'justify-center',
                        )}
                      >
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
                        {expanded ? (
                          <div className="min-w-0 flex-1">
                            <div className="line-clamp-2 text-sm font-semibold leading-snug text-stone-900">
                              {a.name}
                            </div>
                          </div>
                        ) : null}
                        {expanded ? (
                          <span
                            className={cn(
                              'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                              a.status === 'active'
                                ? 'bg-mngmnt-coral text-mngmnt-paper'
                                : 'bg-stone-200 text-stone-600',
                            )}
                          >
                            {a.status === 'active' ? 'Active' : 'Soon'}
                          </span>
                        ) : null}
                      </div>
                      {expanded && a.description ? (
                        <p className="mt-2 line-clamp-2 text-xs leading-snug text-stone-500">
                          {a.description}
                        </p>
                      ) : null}
                    </>
                  )}
                </NavLink>
              );
            })}

            {expanded ? (
              <div className="rounded-xl border border-dashed border-stone-300 p-3">
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
            ) : null}
          </nav>
        </div>

        {expanded ? (
          <div className="border-t border-stone-200 px-5 py-3 text-[11px] text-stone-400">
            v0.1 · internal
          </div>
        ) : null}
      </aside>
    </>
  );
}

export default Sidebar;
