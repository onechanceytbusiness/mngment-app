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
import { dismissAlert as apiDismiss, getAlerts } from '@/lib/api';
import type { Alert, AlertStatus } from '@/lib/types';

interface AlertsContextValue {
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  lastUpdatedAt: number | null;
  refresh: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  /**
   * Apply a client-side status override (e.g. when the user reviews or
   * publishes from the editor). Persists for the lifetime of the page so
   * polling does not flip the status back. A real backend would persist
   * this server-side and the override layer could be removed.
   */
  setStatus: (id: string, status: AlertStatus) => void;
}

const AlertsContext = createContext<AlertsContextValue | null>(null);

// 10 minutes. Was 2 min — bumped to cut load on the /alerts webhook
// (which under the hood may touch Supabase). User-driven refresh from
// the Live Alerts view still works on demand.
const POLL_INTERVAL_MS = 600_000;

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [serverAlerts, setServerAlerts] = useState<Alert[]>([]);
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, AlertStatus>
  >({});
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const inFlight = useRef(false);

  const fetchOnce = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const next = await getAlerts();
      setServerAlerts(next);
      setLastUpdatedAt(Date.now());
    } catch {
      // Swallow polling errors — they surface as stale data, not a crash.
      // A manual refresh will throw and let the caller toast.
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
    // Manual refresh — let errors surface for toasts.
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const next = await getAlerts();
      setServerAlerts(next);
      setLastUpdatedAt(Date.now());
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  const dismiss = useCallback(async (id: string) => {
    // Optimistic removal first, rollback on failure.
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    try {
      await apiDismiss(id);
    } catch (err) {
      setDismissedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      throw err;
    }
  }, []);

  const setStatus = useCallback((id: string, status: AlertStatus) => {
    setStatusOverrides((prev) => ({ ...prev, [id]: status }));
  }, []);

  const alerts = useMemo(() => {
    return serverAlerts
      .filter((a) => !dismissedIds.has(a.id))
      .map((a) => ({
        ...a,
        status: statusOverrides[a.id] ?? a.status,
      }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [serverAlerts, dismissedIds, statusOverrides]);

  const unreadCount = useMemo(
    () => alerts.filter((a) => a.status === 'new').length,
    [alerts],
  );

  const value = useMemo<AlertsContextValue>(
    () => ({
      alerts,
      unreadCount,
      loading,
      lastUpdatedAt,
      refresh,
      dismiss,
      setStatus,
    }),
    [alerts, unreadCount, loading, lastUpdatedAt, refresh, dismiss, setStatus],
  );

  return (
    <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>
  );
}

export function useAlerts(): AlertsContextValue {
  const ctx = useContext(AlertsContext);
  if (!ctx) {
    throw new Error('useAlerts must be used inside <AlertsProvider>');
  }
  return ctx;
}
