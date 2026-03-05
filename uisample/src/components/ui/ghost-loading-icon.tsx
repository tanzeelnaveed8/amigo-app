import React from 'react';
import { motion } from 'motion/react';
import { Ghost } from 'lucide-react';

interface GhostLoadingIconProps {
  size?: number;
  className?: string;
}

export const GhostLoadingIcon: React.FC<GhostLoadingIconProps> = ({ 
  size = 20, 
  className = "" 
}) => {
  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      animate={{
        y: [0, -4, 0],
        opacity: [1, 0.6, 1]
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Ghost size={size} className="text-current" />
    </motion.div>
  );
};
