import React from 'react';
import { cn } from '../../lib/utils';

interface GhostInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const GhostInput = React.forwardRef<HTMLInputElement, GhostInputProps>(
  ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium text-[#8B8CAD] ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E607E] group-focus-within:text-[#9B7BFF] transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "flex h-12 w-full rounded-xl border border-[rgba(255,255,255,0.12)] bg-[#0E0E18] px-4 py-2 text-white placeholder:text-[#5E607E] focus:border-[#9B7BFF] focus:outline-none focus:ring-1 focus:ring-[#9B7BFF] disabled:cursor-not-allowed disabled:opacity-50 transition-all",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-[#FF6363] focus:border-[#FF6363] focus:ring-[#FF6363]",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E607E]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-[#FF6363] ml-1">{error}</p>
        )}
      </div>
    );
  }
);

GhostInput.displayName = 'GhostInput';
