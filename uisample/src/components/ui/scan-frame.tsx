import React from 'react';
import { motion } from 'motion/react';

interface ScanFrameProps {
  size?: number;
}

export const ScanFrame = ({ size = 280 }: ScanFrameProps) => {
  return (
    <div 
      style={{ width: size, height: size }} 
      className="relative flex items-center justify-center"
    >
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-[#9B7BFF] rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-[#9B7BFF] rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-[#9B7BFF] rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-[#9B7BFF] rounded-br-lg" />

      {/* Scanning Line */}
      <motion.div
        className="absolute w-full h-[2px] bg-[#9B7BFF] shadow-[0_0_8px_#9B7BFF]"
        animate={{ top: ['0%', '100%'] }}
        transition={{ 
          duration: 2, 
          ease: "linear", 
          repeat: Infinity,
          repeatType: "loop" 
        }}
      />
      
      {/* Subtle Grid Background (Optional Tech Feel) */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
    </div>
  );
};
