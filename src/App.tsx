import { Suspense } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { Spinner } from '@/components/ui/Spinner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NotFound } from '@/components/layout/NotFound';
import { getAutomationComponent } from '@/config/automationRegistry';
import { AlertsProvider } from '@/features/live-alerts/AlertsProvider';

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

export default function App() {
  return (
    <ToastProvider>
      <AlertsProvider>
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
      </AlertsProvider>
    </ToastProvider>
  );
}
