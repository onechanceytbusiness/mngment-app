import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { automations } from '@/config/automations';
import { apiConfig } from '@/lib/api/config';
import { useAuth } from '@/features/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export function TopBar() {
  const { id } = useParams<{ id: string }>();
  const { user, signOut } = useAuth();
  const current = automations.find((a) => a.id === id);
  const isMock = apiConfig.mode === 'mock';
  const [signingOut, setSigningOut] = useState(false);

  const title = current
    ? current.subtitle
      ? `${current.name} – ${current.subtitle}`
      : current.name
    : 'mngmnt';

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      // onAuthStateChange will swap the gate to <LoginScreen/>, but in the
      // brief window before it fires we still want the button re-enabled
      // if Supabase returned synchronously.
      setSigningOut(false);
    }
  };

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-6 md:px-10">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold text-stone-900">{title}</h1>
        {current?.description ? (
          <p className="hidden truncate text-sm text-stone-500 md:block">
            {current.description}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <span
          className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700"
          title={`API base: ${apiConfig.baseUrl || '(unset)'}`}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isMock ? 'bg-mngmnt-coral' : 'bg-mngmnt-ink',
            )}
          />
          API mode: {apiConfig.mode}
        </span>
        {user ? (
          <div className="flex items-center gap-2">
            <span
              className="hidden max-w-[200px] truncate text-xs font-medium text-stone-600 md:inline"
              title={user.email ?? ''}
            >
              {user.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              loading={signingOut}
              disabled={signingOut}
              leftIcon={<LogOut className="h-4 w-4" />}
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default TopBar;
