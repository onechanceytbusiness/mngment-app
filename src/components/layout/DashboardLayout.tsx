import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export function DashboardLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-mngmnt-paper text-stone-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-mngmnt-paper p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
