import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from '@/components/ui/Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-soft disabled:bg-brand-300',
  secondary:
    'bg-white text-stone-800 border border-stone-200 hover:bg-stone-50 active:bg-stone-100 shadow-soft disabled:text-stone-400',
  ghost:
    'bg-transparent text-stone-700 hover:bg-stone-100 active:bg-stone-200 disabled:text-stone-400',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-soft disabled:bg-rose-300',
  gradient:
    'bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:from-brand-700 hover:to-brand-600 shadow-card disabled:opacity-60',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      type = 'button',
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'disabled:cursor-not-allowed',
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <Spinner size={size === 'lg' ? 'md' : 'sm'} />
        ) : leftIcon ? (
          <span className="inline-flex shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!loading && rightIcon ? (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        ) : null}
      </button>
    );
  },
);

export default Button;
