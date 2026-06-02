import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padded?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { hoverable = false, padded = true, className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-stone-200 bg-white shadow-soft transition-all',
        padded && 'p-6',
        hoverable &&
          'cursor-pointer hover:-transtone-y-0.5 hover:border-brand-300 hover:shadow-card hover:ring-2 hover:ring-brand-100',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;
