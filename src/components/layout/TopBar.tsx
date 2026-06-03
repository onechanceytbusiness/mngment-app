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
      setSigningOut(false);
    }
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-stone-200 bg-white px-3 md:h-20 md:gap-3 md:px-10">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-bold text-stone-900 md:text-lg">
          {title}
        </h1>
        {current?.description ? (
          <p className="hidden truncate text-sm text-stone-500 md:block">
            {current.description}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {/*
          On mobile the API-mode pill collapses to a single coloured dot
          (still tooltipped). On md+ the full "API mode: real|mock" label
          shows. Keeps a status indicator visible without eating the bar.
        */}
        <span
          className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-2 py-1.5 text-xs font-semibold text-stone-700 md:px-3"
          title={`API mode: ${apiConfig.mode}${
            apiConfig.baseUrl ? ` · base: ${apiConfig.baseUrl}` : ''
          }`}
          aria-label={`API mode: ${apiConfig.mode}`}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              isMock ? 'bg-mngmnt-coral' : 'bg-mngmnt-ink',
            )}
          />
          <span className="hidden md:inline">API mode: {apiConfig.mode}</span>
        </span>
        {user ? (
          <div className="flex shrink-0 items-center gap-2">
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
              aria-label="Sign out"
              className="!px-2 md:!px-3"
            >
              <span className="hidden md:inline">Sign out</span>
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default TopBar;
