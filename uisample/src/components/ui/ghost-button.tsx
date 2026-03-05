import React from 'react';
import { motion } from 'motion/react';
import { GhostLoadingIcon } from './ghost-loading-icon';
import { cn } from '../../lib/utils';

interface GhostButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export const GhostButton = React.forwardRef<HTMLButtonElement, GhostButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, iconLeft, iconRight, fullWidth, children, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center rounded-2xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-gradient-to-r from-[#9B7BFF] to-[#B88DFF] text-white shadow-[0px_0px_20px_rgba(155,123,255,0.3)] border border-transparent hover:shadow-[0px_0px_32px_rgba(155,123,255,0.5)]",
      secondary: "bg-[#181830] text-white border border-[rgba(255,255,255,0.04)] hover:bg-[#1f1f3a]",
      ghost: "bg-transparent text-[#C5C6E3] hover:text-white hover:bg-[rgba(255,255,255,0.04)]",
      danger: "bg-[#FF6363] text-white shadow-sm hover:bg-[#ff4f4f]",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-12 px-6 text-base",
      lg: "h-14 px-8 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <span className="mr-2"><GhostLoadingIcon size={16} /></span>}
        {!loading && iconLeft && <span className="mr-2">{iconLeft}</span>}
        {children}
        {!loading && iconRight && <span className="ml-2">{iconRight}</span>}
      </motion.button>
    );
  }
);

GhostButton.displayName = 'GhostButton';