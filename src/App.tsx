import { Suspense } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { Spinner } from '@/components/ui/Spinner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NotFound } from '@/components/layout/NotFound';
import { getAutomationComponent } from '@/config/automationRegistry';
import { AlertsProvider } from '@/features/live-alerts/AlertsProvider';
import { useAuth } from '@/features/auth/AuthProvider';
import { LoginScreen } from '@/features/auth/LoginScreen';

function AutomationRoute() {
  const { id } = useParams<{ id: string }>();
  const Component = id ? getAutomationComponent(id) : undefined;

  if (!Component) {
    return <NotFound />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[40vh] items-center justify-center text-stone-400">
          <Spinner size="lg" />
        </div>
      }
    >
      <Component />
    </Suspense>
  );
}

/**
 * Auth gate sits inside ToastProvider + AlertsProvider so:
 *   - Toasts emitted during the OAuth callback render correctly.
 *   - The Sidebar's unread-count provider stays a single mount point
 *     across login → app transition (no remount churn after sign-in).
 *
 * Polling fetches in AlertsProvider silently swallow errors when the
 * Authorization header is missing (i.e. while logged out), so this is safe.
 */
function GatedRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-mngmnt-paper">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/automations/fashion-audit" replace />}
      />
      <Route element={<DashboardLayout />}>
        <Route path="/automations/:id" element={<AutomationRoute />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AlertsProvider>
        <GatedRoutes />
      </AlertsProvider>
    </ToastProvider>
  );
}
