import { useParams } from 'react-router-dom';
import { automations } from '@/config/automations';
import { apiConfig } from '@/lib/api/config';
import { cn } from '@/lib/cn';

export function TopBar() {
  const { id } = useParams<{ id: string }>();
  const current = automations.find((a) => a.id === id);
  const isMock = apiConfig.mode === 'mock';

  const title = current
    ? current.subtitle
      ? `${current.name} – ${current.subtitle}`
      : current.name
    : 'mngmnt';

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
      </div>
    </header>
  );
}

export default TopBar;
