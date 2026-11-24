'use client';
import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-sans font-medium transition-all duration-150 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#53634A] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-[#53634A] text-white hover:bg-[#3d4a36] active:bg-[#2e3828]',
      secondary: 'border border-[#53634A] text-[#53634A] hover:bg-[#53634A] hover:text-white',
      ghost: 'text-[#53634A] hover:bg-[#53634A]/10',
      danger: 'bg-[#C0392B] text-white hover:bg-[#a93226]',
    };
    const sizes: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-5 text-sm',
      lg: 'h-12 px-7 text-base',
    };
    return (
      <button ref={ref} disabled={disabled || loading} className={cn(base, variants[variant], sizes[size], className)} {...props}>
        {loading ? <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
