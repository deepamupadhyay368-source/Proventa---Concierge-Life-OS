'use client';
import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#171A17]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded-sm border border-[#E5E3DB] bg-white px-3 text-sm text-[#171A17] placeholder:text-[#9A9A8A] transition-colors',
            'focus:border-[#53634A] focus:outline-none focus:ring-1 focus:ring-[#53634A]',
            error && 'border-[#C0392B] focus:border-[#C0392B] focus:ring-[#C0392B]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#C0392B]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#6B7280]">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
