import React from 'react';
import { motion } from 'motion/react';
import { VolumeX, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MutedIndicatorProps {
  mutedUntil: Date | null | undefined;
}

export const MutedIndicator = ({ mutedUntil }: MutedIndicatorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#FBBF24]/10 border border-[rgba(251,191,36,0.3)] rounded-xl p-4 mb-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#FBBF24]/20 border border-[rgba(251,191,36,0.4)] flex items-center justify-center flex-shrink-0">
          <VolumeX size={18} className="text-[#FBBF24]" />
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-white mb-1">
            You're muted by an admin
          </p>
          <p className="text-[12px] text-[#C5C6E3]">
            {mutedUntil 
              ? `You can send messages ${formatDistanceToNow(mutedUntil, { addSuffix: true })}`
              : 'You cannot send messages until unmuted'
            }
          </p>
        </div>
      </div>
    </motion.div>
  );
};
