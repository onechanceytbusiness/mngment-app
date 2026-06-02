import { Card } from '@/components/ui/Card';
import type { Title } from '@/lib/types';

export interface TitleGridProps {
  titles: Title[];
  onSelect: (t: Title) => void;
}

export function TitleGrid({ titles, onSelect }: TitleGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
      {titles.map((t) => (
        <Card
          key={t.id}
          hoverable
          onClick={() => onSelect(t)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(t);
            }
          }}
        >
          <h3 className="font-medium text-stone-900">{t.headline}</h3>
          {t.rationale ? (
            <p className="mt-2 text-sm text-stone-500">{t.rationale}</p>
          ) : null}
          {t.source ? (
            <p className="mt-3 text-xs text-stone-400">{t.source}</p>
          ) : null}
        </Card>
      ))}
    </div>
  );
}

export default TitleGrid;
