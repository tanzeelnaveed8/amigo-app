import React from 'react';
import { motion } from 'motion/react';
import { Ban, ShieldAlert } from 'lucide-react';
import { GhostButton } from '../components/ui/ghost-button';

interface BannedScreenProps {
  crowdName: string;
  onGoBack: () => void;
}

export const BannedScreen = ({ crowdName, onGoBack }: BannedScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen w-full flex-col bg-gradient-to-b from-[#050509] to-[#141426] p-6 justify-center items-center"
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mb-8 relative"
      >
        {/* Glow effect */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.4, 0.6]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2.5,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-[#FF6363] rounded-full blur-3xl"
        />
        
        <div className="relative bg-[#141422] p-8 rounded-full border border-[rgba(255,99,99,0.4)] shadow-[0_0_40px_rgba(255,99,99,0.4)]">
          <Ban size={64} className="text-[#FF6363] drop-shadow-[0_0_20px_rgba(255,99,99,1)]" />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-center max-w-md"
      >
        <h1 className="text-[28px] font-bold text-white mb-3">
          You're Banned
        </h1>
        <p className="text-[16px] text-[#C5C6E3] leading-relaxed mb-8">
          You have been permanently banned from <span className="text-[#FF6363] font-semibold">{crowdName}</span> by an admin.
        </p>

        <div className="bg-[#141422] border border-[rgba(255,99,99,0.3)] rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <ShieldAlert size={20} className="text-[#FF6363] mt-0.5 flex-shrink-0" />
            <div className="text-left space-y-2">
              <p className="text-[13px] text-[#C5C6E3] leading-relaxed">
                • You cannot rejoin this crowd
              </p>
              <p className="text-[13px] text-[#C5C6E3] leading-relaxed">
                • This ban is permanent
              </p>
              <p className="text-[13px] text-[#C5C6E3] leading-relaxed">
                • You can still join other crowds
              </p>
            </div>
          </div>
        </div>

        <GhostButton
          fullWidth
          size="lg"
          onClick={onGoBack}
          variant="secondary"
        >
          Go Back
        </GhostButton>
      </motion.div>
    </motion.div>
  );
};
