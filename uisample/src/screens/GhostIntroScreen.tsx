import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, UserX, Clock, Zap, LucideIcon } from 'lucide-react';
import { GhostButton } from '../components/ui/ghost-button';
import { Ghost } from 'lucide-react';

interface GhostIntroScreenProps {
  onBack: () => void;
  onContinue: () => void;
}

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
}

const FeatureItem = ({ icon: Icon, title, description, delay }: FeatureItemProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="flex flex-row items-start gap-4"
  >
    <div className="w-11 h-11 rounded-xl bg-[#9B7BFF]/20 flex items-center justify-center shrink-0">
      <Icon size={22} className="text-[#9B7BFF]" />
    </div>
    <div className="flex-1">
      <h3 className="text-[16px] font-semibold text-white mb-1">{title}</h3>
      <p className="text-[14px] text-[#C5C6E3] leading-[20px]">{description}</p>
    </div>
  </motion.div>
);

export const GhostIntroScreen = ({ onBack, onContinue }: GhostIntroScreenProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="flex h-screen w-full flex-col bg-gradient-to-b from-[#050509] to-[#141426] px-6 pt-12 pb-8 justify-between"
      aria-label="Ghost Mode Introduction"
    >
      {/* Top Bar */}
      <div className="w-full pt-2">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 text-[#C5C6E3] hover:text-white transition-colors"
          aria-label="Go back to entry screen"
        >
          <ChevronLeft size={28} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="flex flex-col items-center mb-10">
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="mb-8"
          >
            <Ghost size={100} className="text-[#9B7BFF]" />
          </motion.div>
          
          <h1 className="text-[28px] font-bold text-white text-center mb-3">
            Welcome to Ghost Mode 👻
          </h1>
          <p className="text-[18px] font-semibold text-[#C5C6E3] text-center">
            Join or create temporary crowds without login.
          </p>
        </div>

        <div className="space-y-6">
          <FeatureItem 
            icon={UserX}
            title="Fully Anonymous"
            description="No phone numbers, no emails. Just a ghost name."
            delay={0}
          />
          <FeatureItem 
            icon={Clock}
            title="Temporary Crowds"
            description="Crowds expire automatically. No history saved."
            delay={0.1}
          />
          <FeatureItem 
            icon={Zap}
            title="Instant Access"
            description="Create or join crowds with a simple QR scan."
            delay={0.2}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-md mx-auto mt-8">
        <GhostButton 
          fullWidth 
          variant="primary" 
          size="lg"
          onClick={onContinue}
          data-testid="ghost-intro-continue-button"
          aria-label="Continue to choose your ghost name"
        >
          Continue in Ghost Mode
        </GhostButton>
        <p className="text-[12px] text-[#8B8CAD] text-center mt-4 leading-[16px]">
          By continuing, you agree that your identity remains anonymous and crowds are temporary.
        </p>
      </div>
    </motion.div>
  );
};
