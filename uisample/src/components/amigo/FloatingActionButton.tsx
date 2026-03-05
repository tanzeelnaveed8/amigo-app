import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, MessageCircle, Users, Radio } from 'lucide-react';

interface FloatingActionButtonProps {
  isDarkMode?: boolean;
  activeTab: 'dm' | 'groups' | 'signals';
  onCreateDM?: () => void;
  onCreateGroup?: () => void;
  onCreateSignal?: () => void;
}

export const FloatingActionButton = ({
  isDarkMode = true,
  activeTab,
  onCreateDM,
  onCreateGroup,
  onCreateSignal,
}: FloatingActionButtonProps) => {
  const handleClick = () => {
    switch (activeTab) {
      case 'dm':
        onCreateDM?.();
        break;
      case 'groups':
        onCreateGroup?.();
        break;
      case 'signals':
        onCreateSignal?.();
        break;
    }
  };

  return (
    <motion.button
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="fixed bottom-8 right-6 w-[64px] h-[64px] bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center z-50 group"
      style={{
        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.5), 0 0 0 0 rgba(59, 130, 246, 0.4)'
      }}
    >
      {/* Pulse Effect */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full bg-[#3B82F6]"
      />
      
      {/* Icon */}
      <motion.div
        animate={{ rotate: [0, 90, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Plus size={30} className="text-white relative z-10" strokeWidth={2.5} />
      </motion.div>
    </motion.button>
  );
};