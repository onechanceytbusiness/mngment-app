import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { countUnpostedDeals } from '@/lib/api';

interface DealsContextValue {
  /** Number of deals where status <> 'posted' across both audiences. */
  unpostedCount: number;
  /** True while a manual or polled refresh is in flight. */
  loading: boolean;
  /** Force a fresh count (e.g. after add/post/delete in the view). */
  refresh: () => Promise<void>;
}

const DealsContext = createContext<DealsContextValue | null>(null);

const POLL_INTERVAL_MS = 120_000; // 2 minutes — matches AlertsProvider

/**
 * App-root provider that maintains a live count of unposted deals so the
 * sidebar badge stays fresh without the user being on the deals page.
 *
 * Mutations from inside the deals view call refresh() to update the count
 * immediately; the interval is just a safety net for changes made
 * elsewhere (another tab, a teammate, etc.).
 */
export function DealsProvider({ children }: { children: ReactNode }) {
  const [unpostedCount, setUnpostedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);

  const fetchOnce = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const next = await countUnpostedDeals();
      setUnpostedCount(next);
    } catch {
      // Swallow polling errors. If Supabase is unreachable / RLS denies,
      // the badge stays at its last known value rather than blowing up
      // the sidebar. A manual refresh from the view surfaces the error.
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  // Initial fetch + interval polling.
  useEffect(() => {
    void fetchOnce();
    const handle = window.setInterval(() => {
      void fetchOnce();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(handle);
  }, [fetchOnce]);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const next = await countUnpostedDeals();
      setUnpostedCount(next);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  const value = useMemo<DealsContextValue>(
    () => ({ unpostedCount, loading, refresh }),
    [unpostedCount, loading, refresh],
  );

  return (
    <DealsContext.Provider value={value}>{children}</DealsContext.Provider>
  );
}

export function useDeals(): DealsContextValue {
  const ctx = useContext(DealsContext);
  if (!ctx) {
    throw new Error('useDeals must be used inside <DealsProvider>');
  }
  return ctx;
}
