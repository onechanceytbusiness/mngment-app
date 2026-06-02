import { cn } from '@/lib/cn';

export interface PriorityChipProps {
  score: number; // 0-100
  className?: string;
}

/**
 * Priority is signalled by intensity, not by hue (the mngmnt palette is
 * strict — ink/coral/paper only).
 *
 * - High (≥80):  solid coral with paper text
 * - Medium (60-79): soft coral bg with deep-coral text
 * - Low (<60):  neutral stone bg with ink text
 */
export function PriorityChip({ score, className }: PriorityChipProps) {
  const tier =
    score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';

  const styles =
    tier === 'high'
      ? 'bg-mngmnt-coral text-mngmnt-paper'
      : tier === 'medium'
        ? 'bg-brand-100 text-brand-700'
        : 'bg-stone-100 text-stone-700';

  return (
    <span
      className={cn(
        'inline-flex h-7 min-w-[3rem] items-center justify-center gap-1 rounded-md px-2 text-xs font-bold tabular-nums',
        styles,
        className,
      )}
      title={`Newsworthiness score: ${score} / 100`}
    >
      <span>{score}</span>
      <span className="opacity-60">/100</span>
    </span>
  );
}

export default PriorityChip;
