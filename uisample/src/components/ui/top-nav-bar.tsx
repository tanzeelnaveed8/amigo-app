import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface TopNavBarProps {
  title?: string;
  subtitle?: string;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  onBack?: () => void;
  className?: string;
  transparent?: boolean;
}

export const TopNavBar = ({ 
  title, 
  subtitle, 
  leftAccessory, 
  rightAccessory, 
  onBack,
  className,
  transparent = false
}: TopNavBarProps) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "sticky top-0 z-50 flex h-14 items-center justify-between px-4",
        !transparent && "bg-[#050509]/80 backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)]",
        className
      )}
    >
      <div className="flex w-16 items-center justify-start">
        {leftAccessory ? (
          leftAccessory
        ) : onBack ? (
          <button 
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all text-[#FFFFFF]"
          >
            <ArrowLeft size={24} />
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {title && (
          <h1 className="text-[17px] font-semibold text-white leading-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <span className="text-[12px] font-normal text-[#8B8CAD] leading-tight">
            {subtitle}
          </span>
        )}
      </div>

      <div className="flex w-16 items-center justify-end">
        {rightAccessory}
      </div>
    </motion.header>
  );
};
