import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface SegmentedControlProps {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  className?: string;
}

export const SegmentedControl = ({ values, selectedIndex, onChange, className }: SegmentedControlProps) => {
  return (
    <div className={cn("relative flex h-10 w-full rounded-lg bg-[#0E0E18] p-1", className)}>
      {/* Moving background highlight */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-[6px] bg-[#25263A] shadow-sm"
        initial={false}
        animate={{
          x: `${selectedIndex * 100}%`,
          width: `${100 / values.length}%`
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      
      {values.map((value, index) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(index)}
          className={cn(
            "relative z-10 flex flex-1 items-center justify-center text-sm font-medium transition-colors",
            selectedIndex === index ? "text-white" : "text-[#8B8CAD] hover:text-[#C5C6E3]"
          )}
        >
          {value}
        </button>
      ))}
    </div>
  );
};
