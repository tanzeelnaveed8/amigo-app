import React from 'react';
import { motion } from 'motion/react';
import { Ghost, LogIn } from 'lucide-react';
import { GhostButton } from '../components/ui/ghost-button';

interface EntryScreenProps {
  onSelectGhost: () => void;
  onSelectLogin: () => void;
}

export const EntryScreen = ({ onSelectGhost, onSelectLogin }: EntryScreenProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex h-screen w-full flex-col bg-gradient-to-b from-[#050509] to-[#141426] p-6 pt-20 pb-12 justify-between"
      aria-label="Welcome to Ghost Mode. Choose how to continue."
    >
      <div className="flex-1 flex flex-col items-center justify-center mb-10">
        <motion.div 
          className="mb-8"
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Ghost size={80} className="text-white opacity-90" />
        </motion.div>
        
        <h1 className="text-[28px] font-bold text-white text-center leading-[34px] mb-3">
          Welcome
        </h1>
        <p className="text-[16px] text-[#C5C6E3] text-center max-w-xs leading-[22px]">
          Choose how you want to continue
        </p>
      </div>

      <div className="w-full space-y-4 max-w-md mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <GhostButton 
            fullWidth 
            variant="primary" 
            size="lg"
            iconLeft={<Ghost size={20} />}
            onClick={onSelectGhost}
            data-testid="entry-ghost-mode-button"
            aria-label="Enter Ghost Mode for anonymous temporary crowds"
          >
            Enter Ghost Mode
          </GhostButton>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex items-center my-4"
        >
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.04)]" />
          <span className="px-4 text-[12px] text-[#8B8CAD]">or</span>
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.04)]" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <GhostButton 
            fullWidth 
            variant="secondary" 
            size="lg"
            iconLeft={<LogIn size={20} />}
            onClick={onSelectLogin}
            data-testid="entry-auth-button"
            aria-label="Login or sign up for persistent account"
          >
            Login / Sign Up
          </GhostButton>
        </motion.div>

        <div className="mt-5">
          <p className="text-[12px] text-[#8B8CAD] text-center leading-[18px]">
            Ghost Mode: No login required, temporary crowds, fully anonymous.
          </p>
        </div>
      </div>
    </motion.div>
  );
};